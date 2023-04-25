
/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 */
define(['N/currentRecord', 'N/search'], function (currentRecord, search)  {
        
    const beforeLoad = function (ctx) {
        const form = ctx.form;
        const registro = ctx.newRecord;
        const idContrato = registro.getValue("id");

        if (ctx.type == ctx.UserEventType.VIEW) {
            form.addButton({
                id: "custpage_lrc_renegociacao",
                label: "Renegociação",
                functionName: "window.open('/app/site/hosting/scriptlet.nl?script=2273&deploy=1&idContrato="+idContrato+"')"
            })
        }
    }
    
    return {
        beforeLoad: beforeLoad
    }

});