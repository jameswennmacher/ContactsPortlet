PORTLET_JS_CONTROL = function(opts) {

    var nspace = opts.nspace;
    var baseUrl = opts.baseUrl + "ajax/";
    var rootID = opts.rootID;
    
    var messages = opts.messages;
    
    var context = this;
    
    var $ = this.jQuery;
    var $id = context.$id;
    var $class = context.$class;
    
    
    $id("contact-domains").tabs();
    
    
    $(".accordion", opts.rootNode).accordion({ 
        change: function(event, ui) { 
            
            var link = ui.newContent.attr("rel");
                    
            if(link != undefined) {
                ui.newContent.contents().remove();
                ui.newContent.append('<img src="'+opts.baseUrl+'/images/loading.gif"/>'); 
                            
                ui.newContent.load(link + " #content");
             
            }
        },
        collapsible: true,
        autoHeight: false,
        active: false
    });
  
  
    // set autocomplete on search box
    $("#"+rootID+" div.contact-domain .searchBox").autocomplete( {
        appendTo: "#"+rootID,
        source: function(request, response) {
            var URL = $(".searchForm", domain).attr("action");
            URL  = URL.replace(escape("||ID||"), "autoComplete");
            URL  = URL.replace(escape("||TERM||"), escape(request.term));
            URL = URL.replace(escape("||FILTER||"), escape($("input[name=filter]:radio:checked").val()));
            
            $.getJSON( 
                URL,
                {}, 
                function(data) {
                    var regex = new RegExp("(?![^&;]+;)(?!<[^<>]*)(" + request.term.replace(/([\^\$\(\)\[\]\{\}\*\.\+\?\|\\])/gi, "\\$1") + ")(?![^<>]*>)(?![^&;]+;)", "gi");
                    $.each(data.data, function(index,obj) {
                        obj.label = obj.label.replace(regex, "<strong>$1</strong>");
                    });
                    
                    response(data.data);
                }
            );            
        },
        minLength: 3,
        autoFocus: true
    }).data( "autocomplete" )._renderItem = function( ul, item ) {
            return $( "<li></li>" )
                .data( "item.autocomplete", item )
                .append( "<a>"+ item.label + "</a>" ) //  + + "<br>" + item.desc + "</a>"
                .appendTo( ul );
        };
        
        
    // flush autocomplete cache when filter changes
    $("#"+rootID+" input[name=filter]:radio").change(function() {
        $("#"+rootID+" .searchBox").autocomplete( "flushCache" );								
    });
    
    
    $("#"+rootID+" form.searchForm").submit(function() {
        
        $(".searchButton", $(this)).click();
        
        return false;
        
    });
    
    $("#"+rootID+" .searchButton").click(function () {

        var domain = $(this).closest(".contact-domain");

        var resultsArea = $(".results-area", domain);
        
        var term = escape($("input[name=searchtext]", domain).val());
        var filter = escape($("input[name=filter]:radio:checked", domain).val());
        
        var url = $(".searchForm", domain).attr("action");
        url  = url.replace(escape("||ID||"), "searchDomain");
        url = url.replace(escape("||FILTER||"), filter);
        url = url.replace(escape("||TERM||"), term);
        
        
        resultsArea.contents().remove();
        resultsArea.append('<img src="'+opts.baseUrl+'/images/loading.gif"/>')

        resultsArea.load(url + ' #content', function() {
            domain.trigger("ContactsLoaded");
        });        
        
        
        
        return false;
    });
    
    $("#"+rootID+" .contact-domain").delegate("a.persist", "click", function() {
        
        var link = $(this).attr("href");
        
        $.getJSON(
            link, 
            {}, 
            function(data) {
                
                if (data.STATUS == "OK" && data.saved == "true")
                    context.SuccessDialog("<p><strong>"+messages["saved-success"]+"</strong></p>");
                else
                    context.ErrorDialog("<p><strong>"+messages["saved-failed"]+"</strong></p>");
                
            }
        );
        
        
        return false;
    });
    
    $("#"+rootID+" .contact-domain").delegate("a.delete", "click", function() {
        
        var link = $(this).attr("href");
        
        var contact = $(this).parents("li");
        
        $.getJSON(
            link, 
            {}, 
            function(data) {
                
                if (data.STATUS == "OK" && data.deleted == "true") {
                    $(contact).remove();
                    context.SuccessDialog("<p><strong>"+messages["delete-success"]+"</strong></p>");
                } else
                    context.ErrorDialog("<p><strong>"+messages["delete-failed"]+"</strong></p>");
                
                
            }
        );
        
        
        return false;
    });
    
}

                   