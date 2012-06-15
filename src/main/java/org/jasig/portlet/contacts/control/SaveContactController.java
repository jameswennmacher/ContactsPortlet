package org.jasig.portlet.contacts.control;

import java.io.IOException;
import java.util.Set;
import java.util.StringTokenizer;
import javax.portlet.ActionRequest;
import javax.portlet.ActionResponse;
import javax.portlet.ResourceRequest;
import javax.portlet.ResourceResponse;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.jasig.web.service.AjaxPortletSupport;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.jasig.portlet.contacts.model.Contact;
import org.jasig.portlet.contacts.model.ContactSet;
import org.jasig.portlet.contacts.domains.ContactDomain;
import org.springframework.web.portlet.bind.annotation.ResourceMapping;

/**
 *
 * @author mfgsscw2
 */
@Controller
@RequestMapping("VIEW")
public class SaveContactController {
    
    
    private static Log log = LogFactory.getLog(SaveContactController.class);
    
    @ResourceMapping("persist")
    public String persist(
            ResourceRequest request,
            ResourceResponse response,
            @RequestParam("domain") String domain,
            @RequestParam("source") String source,
            @RequestParam("contact") String contact,
            Model model
    ) throws IOException {
        
        log.debug("PERSIST --  START");
        
        log.debug("DOMAIN :: "+domain);
        log.debug("SOURCE :: "+source);
        log.debug("CONTACT :: "+contact);
        
        boolean saved = false;
        
        for (ContactDomain domainObj : contactDomains)
            if (domainObj.getId().equals(domain)) {
                log.debug("Found domain :: "+domainObj.getId()+" == "+domain);
                Contact toSave = null;
                ContactSet contacts = new ContactSet();
                if (source.equalsIgnoreCase("search")) {
                
                    String[] tokens = contact.split(":");
                    //StringTokenizer tokens = new StringTokenizer(contact, ":");
                    String search = tokens[2];
                    String filter = tokens[3];
                    contacts.addAll(domainObj.search(search,filter));

                } else {
                    contacts.addAll(domainObj.getContacts(source));                    
                }
                
                log.debug(contacts.size() + " CONTACTS to search through");
                for (Contact contactObj : contacts) {
                    log.debug("CONTACT :: "+contact+ " == "+contactObj.getURN()+" :: "+(contact.equalsIgnoreCase(contactObj.getURN())));
                    if (contact.equalsIgnoreCase(contactObj.getURN())) {
                        toSave = contactObj;
                        //break;
                    }
                }
                
                if (toSave != null) {
                    saved = domainObj.save(toSave);
                }
                    
                break;
            }
        
        model.addAttribute("STATUS", "OK");
        log.debug("SAVED :: "+saved);
        model.addAttribute("saved", saved);
        
        log.debug("PERSIST --  END");
        
        return "JSONView";
        
    }
    
    protected AjaxPortletSupport ajaxPortletSupportService;

    @Autowired
    public void setPortletSupport(AjaxPortletSupport support) {
        ajaxPortletSupportService = support;
    }
    
    private Set<ContactDomain> contactDomains;
    @Autowired
    public void setContactDomains(Set<ContactDomain> domains) {
        contactDomains = domains;  
    }
}