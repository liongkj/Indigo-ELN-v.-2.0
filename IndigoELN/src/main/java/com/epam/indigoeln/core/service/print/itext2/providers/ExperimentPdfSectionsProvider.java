package com.epam.indigoeln.core.service.print.itext2.providers;

import com.epam.indigoeln.core.model.Component;
import com.epam.indigoeln.core.model.Experiment;
import com.epam.indigoeln.core.model.Notebook;
import com.epam.indigoeln.core.model.Project;
import com.epam.indigoeln.core.service.print.itext2.PdfSectionsProvider;
import com.epam.indigoeln.core.service.print.itext2.model.experiment.*;
import com.epam.indigoeln.core.service.print.itext2.model.experiment.BatchInformationModel.BatchInformation;
import com.epam.indigoeln.core.service.print.itext2.model.experiment.BatchInformationModel.BatchInformationRow;
import com.epam.indigoeln.core.service.print.itext2.model.experiment.PreferredCompoundsModel.PreferredCompoundsRow;
import com.epam.indigoeln.core.service.print.itext2.model.experiment.RegistrationSummaryModel.RegistrationSummaryRow;
import com.epam.indigoeln.core.service.print.itext2.model.experiment.StoichiometryModel.StoichiometryRow;
import com.epam.indigoeln.core.service.print.itext2.model.image.SvgPdfImage;
import com.epam.indigoeln.core.service.print.itext2.sections.AbstractPdfSection;
import com.epam.indigoeln.core.service.print.itext2.sections.experiment.*;
import com.epam.indigoeln.core.service.print.itext2.utils.LogoUtils;
import com.epam.indigoeln.core.service.print.itext2.utils.MongoExt;
import one.util.streamex.StreamEx;
import org.apache.commons.lang3.StringUtils;

import java.time.Instant;
import java.util.*;
import java.util.stream.Stream;

import static com.epam.indigoeln.core.service.print.itext2.model.experiment.PreferredCompoundsModel.*;
import static java.util.Collections.singletonList;

/**
 * The class is responsible for mapping experiment to a list of pdf sections used by pdf generator.
 */
public final class ExperimentPdfSectionsProvider implements PdfSectionsProvider {
    private final Project project;
    private final Notebook notebook;
    private final Experiment experiment;

    private static final HashMap<String, ComponentToPdfSectionsConverter> componentNameToConverter = new HashMap<>();

    private static final String TITLE = "title";

    private static final String REACTION_DETAILS = "reactionDetails";
    private static final String CONCEPT_DETAILS = "conceptDetails";
    private static final String REACTION = "reaction";
    private static final String PREFERRED_COMPOUND_SUMMARY = "preferredCompoundSummary";
    private static final String STOICH_TABLE = "stoichTable";
    private static final String EXPERIMENT_DESCRIPTION = "experimentDescription";
    private static final String PRODUCT_BATCH_SUMMARY = "productBatchSummary";
    private static final String PRODUCT_BATCH_DETAILS = "productBatchDetails";

    public ExperimentPdfSectionsProvider(Project project, Notebook notebook, Experiment experiment) {
        this.project = project;
        this.notebook = notebook;
        this.experiment = experiment;
    }

    /**
     * @return list of raw uninitialized pdf sections corresponding to experiment components.
     */
    public List<AbstractPdfSection> getContentSections() {
        return StreamEx
                .of(experiment.getComponents())
                .flatMap(this::sections)
                .toList();
    }

    private Stream<AbstractPdfSection> sections(Component component) {
        return Optional.ofNullable(componentNameToConverter.get(component.getName()))
                .map(converter -> converter.convert(component, experiment).stream())
                .orElseGet(Stream::empty);
    }

    static {
        put(REACTION_DETAILS, ExperimentPdfSectionsProvider::reactionDetailsConverter);
        put(CONCEPT_DETAILS, ExperimentPdfSectionsProvider::conceptDetailsConverter);
        put(REACTION, ExperimentPdfSectionsProvider::reactionConverter);
        put(PREFERRED_COMPOUND_SUMMARY, ExperimentPdfSectionsProvider::preferredCompoundSummaryConverter);
        put(STOICH_TABLE, ExperimentPdfSectionsProvider::stoichTableConverter);
        put(EXPERIMENT_DESCRIPTION, ExperimentPdfSectionsProvider::experimentDescriptionConverter);
        put(PRODUCT_BATCH_SUMMARY, ExperimentPdfSectionsProvider::productBatchSummaryConverter);
        put(PRODUCT_BATCH_DETAILS, ExperimentPdfSectionsProvider::productBatchDetailsConverter);
    }

    private static void put(String name, ComponentToPdfSectionsConverter builder) {
        componentNameToConverter.put(name, builder);
    }

    private static List<AbstractPdfSection> reactionDetailsConverter(Component c, Experiment e) {
        return MongoExt.of(c).map(content -> singletonList(new ReactionDetailsSection(new ReactionDetailsModel()
                .setCreationDate(e.getCreationDate())
                .setTherapeuticArea(content.getString("therapeuticArea", "name"))
                .setContinuedFrom(content.streamObjects("contFromRxn").map(m -> m.getString("text")).toList())
                .setContinuedTo(content.streamObjects("contToRxn").map(m -> m.getString("text")).toList())
                .setProjectCode(content.getString("codeAndName", "name"))
                .setProjectAlias(content.getString("projectAliasName"))
                .setLinkedExperiment(content.streamObjects("linkedExperiments").map(m -> m.getString("text")).toList())
                .setLiteratureReference(content.getString("literature"))
                .setCoauthors(content.streamObjects("coAuthors").map(m -> m.getString("name")).toList())
        )));
    }

    private static List<AbstractPdfSection> conceptDetailsConverter(Component c, Experiment e) {
        return MongoExt.of(c).map(content -> singletonList(new ConceptDetailsSection(new ConceptDetailsModel(
                e.getCreationDate(),
                content.getString("therapeuticArea", "name"),
                content.streamObjects("linkedExperiments").map(m -> m.getString("text")).toList(),
                content.getString("codeAndName", "name"),
                content.getString("keywords"),
                content.streamObjects("designers").map(m -> m.getString("name")).toList(),
                content.streamObjects("coAuthors").map(m -> m.getString("name")).toList()
        ))));
    }

    private static List<AbstractPdfSection> reactionConverter(Component c, Experiment e) {
        return MongoExt.of(c).map(content -> {
            String svgBase64 = content.getString("image");
            if (!StringUtils.isBlank(svgBase64)) {
                return singletonList(new ReactionSchemeSection(new ReactionSchemeModel(new SvgPdfImage(svgBase64))));
            } else {
                return Collections.emptyList();
            }
        });
    }

    private static List<AbstractPdfSection> preferredCompoundSummaryConverter(Component c, Experiment e) {
        return MongoExt.of(c).map(content -> {
            List<PreferredCompoundsRow> rows = content.streamObjects("compounds")
                    .map(ExperimentPdfSectionsProvider::getPreferredCompoundsRow)
                    .toList();
            if (!rows.isEmpty()) {
                return singletonList(new PreferedCompoundsSection(new PreferredCompoundsModel(rows)));
            } else {
                return Collections.emptyList();
            }
        });
    }

    private static PreferredCompoundsRow getPreferredCompoundsRow(MongoExt compound) {
        MongoExt stereoisomerObj = compound.getObject("stereoisomer");
        Structure structure = new Structure(compound.getString("virtualCompoundId"),
                stereoisomerObj.getString("name"),
                stereoisomerObj.getString("description"));
        return new PreferredCompoundsRow(
                structure,
                compound.getString("fullNbkBatch"),
                compound.getString("molWeight", "value"),
                compound.getString("formula"),
                compound.getString("structureComments")
        );
    }

    private static List<AbstractPdfSection> stoichTableConverter(Component c, Experiment e) {
        return MongoExt.of(c).map(content -> {
            List<StoichiometryRow> reactants = content.streamObjects("reactants")
                    .map(ExperimentPdfSectionsProvider::getStoichiometryModel)
                    .toList();
            if (!reactants.isEmpty()) {
                return singletonList(new StoichiometrySection((new StoichiometryModel(reactants))));
            } else {
                return Collections.emptyList();
            }
        });
    }

    private static StoichiometryRow getStoichiometryModel(MongoExt reactant) {
        return new StoichiometryRow()
                .setFullNbkBatch(reactant.getString("fullNbkBatch"))
                .setCompoundId(reactant.getString("compoundId"))
                .setStructure(new StoichiometryModel.Structure(new SvgPdfImage(reactant.getString("structure", "image"))))
                .setMolecularWeight(reactant.getString("molWeight", "value"))
                .setWeight(reactant.getString("weight", "value"))
                .setWeightUnit(reactant.getString("weight", "unit"))
                .setMoles(reactant.getString("mol", "value"))
                .setMolesUnit(reactant.getString("mol", "unit"))
                .setVolume(reactant.getString("volume", "value"))
                .setVolumeUnit(reactant.getString("volume", "unit"))
                .setEq(reactant.getString("eq", "value"))
                .setChemicalName(reactant.getString("chemicalName"))
                .setRxnRole(reactant.getString("rxnRole", "name"))
                .setStoicPurity(reactant.getString("stoicPurity", "value"))
                .setMolarity(reactant.getString("molarity", "value"))
                .setMolesUnit(reactant.getString("molarity", "unit"))
                .setHazardComments(reactant.getString("hazardComments"))
                .setSaltCode(reactant.getString("saltCode", "name"))
                .setSaltEq(reactant.getString("saltEq", "value"))
                .setComments(reactant.getString("comments"));
    }

    private static List<AbstractPdfSection> experimentDescriptionConverter(Component c, Experiment e) {
        return MongoExt.of(c).map(content -> {
            String description = content.getString("description");
            if (!StringUtils.isBlank(description)) {
                return singletonList(new ExperimentDescriptionSection(
                        new ExperimentDescriptionModel(description)));
            } else {
                return Collections.emptyList();
            }
        });
    }

    private static List<AbstractPdfSection> productBatchSummaryConverter(Component c, Experiment e) {
        Optional<List<String>> batchOwner = e.getComponents().stream()
                .filter(component -> REACTION_DETAILS.equals(component.getName()))
                .map(MongoExt::of)
                .map(m -> m.streamObjects("batchOwner").map(owner -> owner.getString("name")).toList())
                .findAny();

        List<BatchInformationRow> batchInfoRows = MongoExt.of(c)
                .streamObjects("batches")
                .map(batch -> getBatchInformationRow(batch, batchOwner)).toList();

        List<RegistrationSummaryRow> regSummaryRows = MongoExt.of(c)
                .streamObjects("batches")
                .map(batch -> new RegistrationSummaryRow(
                        batch.getString("fullNbkBatch"),
                        batch.getString("totalWeight", "value"),
                        batch.getString("totalWeight", "unit"),
                        batch.getString("registrationStatus"),
                        batch.getString("conversationalBatchNumber")
                ))
                .filter(row -> Objects.equals(row.getRegistrationStatus(), "PASSED"))
                .toList();

        ArrayList<AbstractPdfSection> result = new ArrayList<>();
        if (!batchInfoRows.isEmpty()) {
            result.add(new BatchInformationSection(new BatchInformationModel(batchInfoRows)));
        }
        if (!regSummaryRows.isEmpty()) {
            result.add(new RegistrationSummarySection(new RegistrationSummaryModel(regSummaryRows)));
        }
        return result;
    }

    private static BatchInformationRow getBatchInformationRow(MongoExt batch, Optional<List<String>> batchOwner) {
        MongoExt stereoisomer = batch.getObject("stereoisomer");
        return new BatchInformationRow()
                .setNbkBatch(batch.getString("nbkBatch"))
                .setStructure(new BatchInformationModel.Structure(
                        new SvgPdfImage(batch.getString("structure", "image")),
                        stereoisomer.getString("name"),
                        stereoisomer.getString("description")
                ))
                .setAmountMade(batch.getString("totalWeight", "value"))
                .setAmountMadeUnit(batch.getString("totalWeight", "unit"))
                .setTheoWeight(batch.getString("theoWeight", "value"))
                .setTheoWeightUnit(batch.getString("theoWeight", "unit"))
                .setYield(batch.getString("yield"))
                .setPurity(batch.getString("stoicPurity", "value"))
                .setBatchInformation(new BatchInformation(
                        batch.getString("molWeight", "value"),
                        batch.getString("exactMass"),
                        batch.getString("saltCode", "name"),
                        batch.getString("saltEq", "value"),
                        batchOwner.orElse(Collections.emptyList()),
                        batch.getString("comments")
                ));
    }

    private static List<AbstractPdfSection> productBatchDetailsConverter(Component c, Experiment e) {
        Optional<MongoExt> content = e.getComponents().stream()
                .filter(component -> PRODUCT_BATCH_SUMMARY.equals(component.getName()))
                .map(Component::getContent)
                .map(MongoExt::of)
                .findAny();

        Optional<List<String>> batchOwner = e.getComponents().stream()
                .filter(component -> REACTION_DETAILS.equals(component.getName()))
                .map(MongoExt::of)
                .map(m -> m.streamObjects("batchOwner").map(owner -> owner.getString("name")).toList())
                .findAny();

        Optional<List<AbstractPdfSection>> sections = content.map(m -> m.streamObjects("batches")
                .map(batch -> (AbstractPdfSection) new BatchDetailsSection(new BatchDetailsModel()
                        .setFullNbkBatch(batch.getString("fullNbkBatch"))
                        .setRegistrationDate(batch.getString("registrationDate"))
                        .setStructureComments(batch.getString("structureComments"))
                        .setSource(batch.getString("source", "name"))
                        .setSourceDetail(batch.getString("sourceDetail", "name"))
                        .setBatchOwner(batchOwner.orElse(Collections.emptyList()))
                        .setMolWeight(batch.getString("molWeight", "value"))
                        .setFormula(batch.getString("formula"))
                        .setResidualSolvent(batch.getString("residualSolvents", "asString"))
                        .setSolubility(batch.getString("solubility", "asString"))
                        .setPrecursors(batch.getString("precursors"))
                        .setExternalSupplier(batch.getString("externalSupplier", "asString"))
                        .setHealthHazards(batch.getString("healthHazards", "asString"))
                        .setHandlingPrecautions(batch.getString("handlingPrecautions", "asString"))
                        .setStorageInstructions(batch.getString("storageInstructions", "asString"))
                ))
                .toList());
        return sections.orElse(Collections.emptyList());
    }

    public ExperimentHeaderSection getHeaderSection() {
        List<Component> components = experiment.getComponents();
        Optional<String> title1 = StreamEx.of(components)
                .findFirst(c -> c.getName().equals(REACTION_DETAILS))
                .map(Component::getContent).map(c -> c.getString(TITLE));
        Optional<String> title2 = StreamEx.of(components)
                .findFirst(c -> c.getName().equals(CONCEPT_DETAILS))
                .map(Component::getContent).map(c -> c.getString(TITLE));

        return new ExperimentHeaderSection(new ExperimentHeaderModel(
                LogoUtils.loadDefaultLogo(),
                Instant.now(),
                experiment.getAuthor().getFullName(),
                notebook.getName() + "-" + experiment.getName(),
                project.getName(),
                experiment.getStatus().toString(),
                title1.orElse(title2.orElse(""))
        ));
    }

    /**
     * All inheritors are responsible for building a list of pdf sections
     * (one component can correspond to several pdf sections)
     */
    @FunctionalInterface
    private interface ComponentToPdfSectionsConverter {
        List<AbstractPdfSection> convert(Component component, Experiment e);
    }

    private static class PdfSectionsBuilderException extends RuntimeException {
        PdfSectionsBuilderException(Throwable e) {
            super(e);
        }
    }
}