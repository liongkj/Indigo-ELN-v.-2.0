package com.epam.indigoeln.core.service.search;

import java.util.Collection;
import java.util.Map;
import java.util.Optional;

import com.epam.indigoeln.web.rest.dto.search.ProductBatchDetailsDTO;

public interface SearchServiceAPI {

    /**
     * Find components (batches) by chemical molecular structure
     * @param structure structure of component
     * @param searchOperator search operator
     * @param options search advanced options
     * @return list of batches with received structure
     */
    Collection<ProductBatchDetailsDTO> searchByMolecularStructure(String structure, String searchOperator, Map options);

    /**
     * Find component by full batch number
     * Full batch number expected in format NOTEBOOK_NUMBER(8 digits)-EXPERIMENT_NUMBER(4 digits)-BATCH_NUMBER(3 digits)
     * @param fullBatchNumber full batch number
     * @return result of search
     */
    Optional<ProductBatchDetailsDTO> searchByNotebookBatchNumber(String fullBatchNumber);
}