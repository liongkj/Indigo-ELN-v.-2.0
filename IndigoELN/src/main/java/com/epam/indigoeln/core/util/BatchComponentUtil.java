package com.epam.indigoeln.core.util;

import java.text.DecimalFormat;
import java.text.Format;
import java.util.Collection;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.OptionalInt;
import java.util.function.Predicate;
import java.util.regex.Pattern;

import com.mongodb.BasicDBList;
import com.mongodb.BasicDBObject;
import org.bson.BasicBSONObject;
import org.springframework.util.StringUtils;

import com.epam.indigoeln.web.rest.dto.ComponentDTO;
import com.epam.indigoeln.web.rest.dto.ExperimentDTO;

import static java.util.stream.Collectors.toList;

/**
 * Utility class for Batches
 */
public final class BatchComponentUtil {

    public static final String COMPONENT_NAME_BATCH_SUMMARY = "productBatchSummary";
    public static final String COMPONENT_FIELD_BATCHES = "batches";
    public static final String COMPONENT_FIELD_STRUCTURE = "structure";
    public static final String COMPONENT_FIELD_STRUCTURE_ID = "structureId";
    public static final String COMPONENT_FIELD_NBK_BATCH = "nbkBatch";
    public static final String COMPONENT_FIELD_FULL_NBK_BATCH = "fullNbkBatch";

    private static final String FORMAT_BATCH_NUMBER  = "000";
    private static final String PATTERN_BATCH_NUMBER = "\\d{3}";

    private BatchComponentUtil() {
    }

    /**
     * Retrieve json content of all batches for each component in received list
     * Filter components named as 'productBatchSummary' and return list of nested batches of each component
     *
     * @param components list of components
     * @return list of batches
     */
    @SuppressWarnings("unchecked")
    public static List<BasicDBObject> retrieveBatches(Collection<ComponentDTO> components) {
        Predicate<ComponentDTO> batchFilter = c -> COMPONENT_NAME_BATCH_SUMMARY.equals(c.getName()) &&
                c.getContent() != null && c.getContent().containsField(COMPONENT_FIELD_BATCHES);

        return components.stream().filter(batchFilter).
               map(component -> (BasicDBList) component.getContent().get(COMPONENT_FIELD_BATCHES)).
               flatMap(Collection::stream).
               map(o -> (BasicDBObject) o).
               collect(toList());
    }

    /**
     * Retrieve json content of all batches for each component in received list.
     * Filter batches by  bingo DB identifier (corresponds to field 'structure.structureId' of batch json content)
     * Only batches with bingo DB identifier from received list should be returned
     *
     * @param components list of components to find batches
     * @param bingoDbIds list of bingo db identifiers
     * @return list of batches
     */
    public static List<BasicDBObject> retrieveBatchesByBingoDbId(Collection<ComponentDTO> components,
                                                                 List<Integer> bingoDbIds) {
        return retrieveBatches(components).stream().filter(b -> bingoDbIds.contains(getBatchBingoDbId(b))).collect(toList());
    }

    /**
     * Retrieve json content of batch with specified full batch number
     *
     * @param components list of components to find batches
     * @param fullBatchNumber full batch number
     * @return map of batch parameters
     */
    public static Optional<Map> retrieveBatchByNumber(Collection<ComponentDTO> components, String fullBatchNumber) {
         return retrieveBatches(components).stream().
                filter(batch -> fullBatchNumber.equals(batch.get(COMPONENT_FIELD_FULL_NBK_BATCH).toString())).findAny().
                map(BasicBSONObject::toMap);
    }


    /**
     * Retrieve batch numbers list for all batches found in received components
     * Filter components named as 'productBatchSummary' and return list of nested batches of each component
     *
     * @param components list of components
     * @return list of batch numbers
     */
    public static List<String> retrieveBatchNumbers(Collection<ComponentDTO> components) {
        return  retrieveBatches(components).stream().
                filter(batch -> batch.containsField(COMPONENT_FIELD_NBK_BATCH)).
                map(batch -> batch.get(COMPONENT_FIELD_NBK_BATCH).toString()).collect(toList());
    }

    /**
     * Find last (maximal) existing batch number for all batches, that contains in components assigned with experiment
     * For proper comparison only batches with batch number specified in NUMERIC (000) format considered
     * If experiment does not contains any batches matches expected format empty result will be returned
     * Method could be used for batch number auto-generation in 'productBatchSummary' components
     *
     * @param experiment experiment
     * @return latest (maximal) existing batch number
     */
    public static OptionalInt getLastBatchNumber(ExperimentDTO experiment) {
        Pattern pattern = Pattern.compile(PATTERN_BATCH_NUMBER);
        Collection<ComponentDTO> components = Optional.ofNullable(experiment.getComponents()).orElse(Collections.emptyList());

        List<String> batchNumbers = retrieveBatchNumbers(components);
        return batchNumbers.stream().filter(item -> item != null && pattern.matcher(item).matches()).
                mapToInt(Integer::parseInt).max();
    }

    /**
     * Format numeric value as batch number string
     *
     * @param number numeric value
     * @return formatted batch number string
     */
    public static String formatBatchNumber(int number) {
        Format formatter = new DecimalFormat(FORMAT_BATCH_NUMBER);
        return formatter.format(number);
    }

    /**
     * Check, that received string corresponds to batch number numeric format
     *
     * @param batchNumber string to validate
     * @return is received string well-formatted batch number
     */
    public static boolean isValidBatchNumber(String batchNumber) {
        return !StringUtils.isEmpty(batchNumber) && Pattern.compile(PATTERN_BATCH_NUMBER).matcher(batchNumber).matches();
    }

    private static Integer getBatchBingoDbId(BasicDBObject batch) {
        Integer result = null;
        if(batch.containsField(COMPONENT_FIELD_STRUCTURE)) {
            BasicDBObject structure = (BasicDBObject) batch.get(COMPONENT_FIELD_STRUCTURE);
            Object structureId = structure.get(COMPONENT_FIELD_STRUCTURE_ID);
            result = structureId != null ? (Integer) structureId : null;
        }
        return result;
    }

}


