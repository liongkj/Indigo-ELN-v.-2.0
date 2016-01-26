package com.epam.indigoeln.web.rest;

import com.epam.indigoeln.core.model.Template;
import com.epam.indigoeln.core.repository.experiment.ExperimentRepository;
import com.epam.indigoeln.core.service.template.TemplateService;
import com.epam.indigoeln.web.rest.dto.TemplateDTO;
import com.epam.indigoeln.web.rest.util.HeaderUtil;
import com.epam.indigoeln.web.rest.util.PaginationUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.net.URI;
import java.net.URISyntaxException;
import java.util.LinkedList;
import java.util.List;
import java.util.stream.Collectors;

/**
 * REST controller for managing Resources
 */
@RestController
@RequestMapping("/api")
public class TemplateResource {

    private final static String WARNING_EXPERIMENTS_ASSIGNED = "Template with identifier %s could not be deleted : any assigned experiments exists.";

    @Autowired
    TemplateService templateService;

    @Autowired
    ExperimentRepository experimentRepository;

    private final Logger log = LoggerFactory.getLogger(TemplateResource.class);

    /**
     * GET /templates/:id -> get template by id
     */
    @RequestMapping(value = "/templates/{id}",
            method = RequestMethod.GET,
            produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<TemplateDTO> getTemplate(@PathVariable String id) {
        return templateService.getTemplateById(id)
                .map(template -> new ResponseEntity<>(template, HttpStatus.OK))
                .orElse(new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    /**
     * GET /templates -> fetch all template list
     */
    @RequestMapping(value = "/templates",
            method = RequestMethod.GET,
            produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<List<TemplateDTO>> getAllTemplates(Pageable pageable)
            throws URISyntaxException {
        log.debug("REST request to get a page of Templates");
        Page<Template> page = templateService.getAllTemplates(pageable);
        HttpHeaders headers = PaginationUtil.generatePaginationHttpHeaders(page, "/api/templates");
        return new ResponseEntity<>(page.getContent().stream()
                .map(TemplateDTO::new)
                .collect(Collectors.toCollection(LinkedList::new)), headers, HttpStatus.OK);
    }

    /**
     * PUT /templates -> create new template
     *
     * <p>
     * Creates new Template.
     * Method enabled for users with "ADMIN" authorities. <br>
     * For correct saving  only <b>name</b> and <b>content(optional)</b> params should be specified
     * in the received template DTO.
     * Other parameters will be auto-generated
     * </p>
     *
     * @param templateDTO template for save
     * @return saved template item wrapped to ResponseEntity
     */
    @RequestMapping(value = "/templates",
            method = RequestMethod.POST,
            produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<TemplateDTO> createTemplate(@Valid @RequestBody TemplateDTO templateDTO) throws URISyntaxException {
        log.debug("REST request to save Template : {}", templateDTO);
        if (templateDTO.getId() != null) {
            return ResponseEntity.badRequest().headers(HeaderUtil.createFailureAlert("template", "idexists", "A new template cannot already have an ID")).body(null);
        }
        TemplateDTO result = templateService.createTemplate(templateDTO);
        return ResponseEntity.created(new URI("/api/templates/" + result.getId()))
                .headers(HeaderUtil.createEntityCreationAlert("template", result.getId().toString()))
                .body(result);
    }

    /**
     * PUT /templates/:id -> create new template
     *
     * <p>
     * Edit existing Template.
     * Method enabled for users with "ADMIN" authorities.
     * For correct saving  only <b>name</b>, <b>content(optional)</b> and <b>id</b> params should be specified
     * in the received template DTO.
     * Other parameters will be auto-generated.
     * Template id should corresponds to existing template item.
     * </p>
     *
     * @param template template for save
     * @return saved template item wrapped to ResponseEntity
     */
    @RequestMapping(value = "/templates",
            method = RequestMethod.PUT,
            produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<TemplateDTO> updateTemplate(@RequestBody TemplateDTO template){
        log.debug("REST request to update Template : {}", template);
        if(!templateService.getTemplateById(template.getId()).isPresent()){
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
        return ResponseEntity.ok()
                .headers(HeaderUtil.createEntityUpdateAlert("template", template.getId().toString()))
                .body(templateService.updateTemplate(template));
    }

    /**
     * DELETE /templates/:id -> delete template
     *
     * <p>
     * Delete Template.
     * Method enabled for users with "ADMIN" authorities.
     * Template id should corresponds to existing template item.
     * Template will not be deleted if any Experiments assigned on it
     * </p>
     *
     * @param id id of template
     * @return operation status Response Entity
     */
    @RequestMapping(value = "/templates/{id}",
            method = RequestMethod.DELETE,
            produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Void> deleteTemplate(@PathVariable String id) {
        log.debug("REST request to delete Template : {}", id);
        //do not delete template if  experiments assigned
        if(experimentRepository.countByTemplateId(id) > 0){
            String message = String.format(WARNING_EXPERIMENTS_ASSIGNED, id);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).headers( HeaderUtil.createAlert(message, id)).
                    build();
        }
        templateService.deleteTemplate(id);
        return ResponseEntity.ok().headers(
                HeaderUtil.createEntityDeletionAlert("template", id.toString())).build();
    }

}
