package com.epam.indigoeln.core.repository.search;

import com.epam.indigoeln.core.repository.search.entity.StructureSearchType;
import com.epam.indigoeln.web.rest.dto.search.request.SearchCriterion;
import org.springframework.data.mongodb.core.aggregation.Aggregation;
import org.springframework.data.mongodb.core.aggregation.AggregationOperation;
import org.springframework.data.mongodb.core.query.Criteria;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;

import static java.util.stream.Collectors.toList;

public class AbstractSearchAggregationBuilder {

    protected List<AggregationOperation> aggregationOperations;
    private Collection<String> searchQueryFields;
    private Collection<String> availableFields;
    private String contextPrefix = "";

    public AbstractSearchAggregationBuilder() {
        aggregationOperations = new ArrayList<>();
    }

    public AbstractSearchAggregationBuilder withBingoIds(StructureSearchType type, List<Integer> bingoIds) {
        return this;
    }

    public AbstractSearchAggregationBuilder withSearchQuery(String searchQuery) {
        List<Criteria> fieldCriteriaList = searchQueryFields.stream().map(
                field -> AggregationUtils.createCriterion(field, searchQuery, "contains", "")
        ).collect(toList());

        Criteria[] fieldCriteriaArr = fieldCriteriaList.toArray(new Criteria[fieldCriteriaList.size()]);
        Criteria orCriteria = new Criteria().orOperator(fieldCriteriaArr);
        aggregationOperations.add(Aggregation.match(orCriteria));
        return this;
    }

    public AbstractSearchAggregationBuilder withAdvancedCriteria(List<SearchCriterion> criteria) {
        List<Criteria> fieldCriteriaList = criteria.stream()
                .filter(c -> availableFields == null || availableFields.contains(c.getField()))
                .map(criterion -> AggregationUtils.createCriterion(criterion, contextPrefix))
                .collect(toList());
        if (!fieldCriteriaList.isEmpty()) {
            Criteria[] mongoCriteriaList = fieldCriteriaList.toArray(new Criteria[fieldCriteriaList.size()]);
            Criteria andCriteria = new Criteria().andOperator(mongoCriteriaList);
            aggregationOperations.add(Aggregation.match(andCriteria));
        }
        return this;
    }

    public void setContextPrefix(String contextPrefix) {
        this.contextPrefix = contextPrefix;
    }

    public void setAvailableFields(Collection<String> availableFields) {
        this.availableFields = availableFields;
    }

    public void setSearchQueryFields(Collection<String> searchQueryFields) {
        this.searchQueryFields = searchQueryFields;
    }
}