
/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 */
define(['N/currentRecord', 'N/search', 'N/runtime'], function (currentRecord, search, runtime) {

    const beforeLoad = function (ctx) {
        const form = ctx.form;
        const registro = ctx.newRecord;
        const registroAtual = currentRecord.get();
        const idContrato = registro.getValue("custrecord_lrc_contratorenegociacao");
        const idRenegoc = registro.getValue("id");
        const status = registro.getValue("custrecord_lrc_statusrenegoc");

        if(status == 1 || status == 2){
            var usuario = runtime.getCurrentUser();
            var idUsuario = usuario.id;
            
        }

        if (ctx.type == ctx.UserEventType.VIEW && status == 3) {
            form.clientScriptModulePath = "./clientScriptSubstituiParcela.js";
            form.addButton({
                id: "custpage_lrc_substituiparcelas",
                label: "Substituir Parcelas",
                functionName: "substituiParcelas(" + idContrato + "," +  idRenegoc  + ")"
            })
        }
    }

    return {
        beforeLoad: beforeLoad
    }

});