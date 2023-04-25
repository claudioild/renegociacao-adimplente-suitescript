/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */
define(['N/currentRecord', 'N/url', 'N/record', 'N/search', 'N/runtime'], function (currentRecord, url, record, search, runtime) {

    function pageInit(scriptContext) {


    }

    function substituiParcelas(idContrato, idRenegoc) {

        console.log(idRenegoc);
        console.log(idContrato);

        var idParcela;
        var numFatura;

        search.create({
            type: 'customrecord_lrc_sublistaparcelasrenegoc',
            filters: [['custrecord_lrc_linksublista', 'IS', idRenegoc]],
            columns: ['custrecord_lrc_idfluxodepagamentos']
        }).run().each(function (result) {

            var idFluxo = result.getValue("custrecord_lrc_idfluxodepagamentos");

            const registroFluxo = record.load({
                type: "customrecord_lrc_fluxodepagamentos",
                id: idFluxo
            })

            registroFluxo.setValue({
                fieldId: "isinactive",
                value: true
            })

            registroFluxo.setValue({
                fieldId: "custrecord_lrc_renegociacao",
                value: idRenegoc
            })

            registroFluxo.save({
                ignoreMandatoryFields: true
            })

            return true;
        })

        var mySearch = search.create({
            type: 'customrecord_lrc_sublistanovasparcelas',
            filters: [['custrecord_lrc_linksubnovasparcelas', 'IS', idRenegoc]],
            columns: ["custrecord_lrc_idnovaparcelac", "custrecordlrc_vencimentonovaparcela", "custrecordlrc_indicenovaparcela", "custrecord_lrc_tiponovaparcela", "custrecord_lrc_valororiginanovalparcela", "custrecord_lrc_jurostpnovaparcela", "custrecord_lrc_valoratualizadonovaparcel"]
        }).run().each(function (result) {

            stringJSON = JSON.stringify(result);

            var data;
            var vencimento = result.getValue("custrecordlrc_vencimentonovaparcela");
            var numParcela = result.getValue("custrecord_lrc_idnovaparcelac");
            var indice = result.getValue("custrecordlrc_indicenovaparcela");
            var tipo = result.getValue("custrecord_lrc_tiponovaparcela");
            var valorOriginal = result.getValue("custrecord_lrc_valororiginanovalparcela");
            var juros = result.getValue("custrecord_lrc_jurostpnovaparcela");
            var valorAtualizado = result.getValue("custrecord_lrc_valoratualizadonovaparcel");


            var vencimentoSeparado = vencimento.split("/");
            dia = vencimentoSeparado[0];
            mes = vencimentoSeparado[1];
            ano = vencimentoSeparado[2];
            data = ano + "-" + mes + "-" + dia + "T00:00"

            vencimento = new Date(data);

            console.log(vencimento);

            const fluxoCriado = record.create({
                type: "customrecord_lrc_fluxodepagamentos"
            })

            fluxoCriado.setValue({
                fieldId: "custrecord_lrc_linkfluxodepagamentos",
                value: idContrato
            });

            fluxoCriado.setValue({
                fieldId: "custrecord_lrc_numeroparcelac",
                value: numParcela
            });

            fluxoCriado.setValue({
                fieldId: "custrecord_lrc_vencimento",
                value: vencimento
            });

            fluxoCriado.setValue({
                fieldId: "custrecordcustrecord_lrc_statuscnab",
                value: 1
            });

            fluxoCriado.setValue({
                fieldId: "custrecord_lrc_tipo",
                value: tipo
            });

            fluxoCriado.setValue({
                fieldId: "custrecord_lrc_indice",
                value: indice
            });

            fluxoCriado.setValue({
                fieldId: "custrecord_lrc_valororiginal",
                value: valorOriginal
            });

            fluxoCriado.setValue({
                fieldId: "custrecord_lrc_juros",
                value: juros
            });

            fluxoCriado.setValue({
                fieldId: "custrecord_lrc_valoratualizado",
                value: valorAtualizado
            });

            fluxoCriado.setValue({
                fieldId: "custrecord_lrc_valorpagoc",
                value: 0
            });

            fluxoCriado.setValue({
                fieldId: "custrecord_lrc_statusparcela",
                value: 1
            });

            var idFluxoCriado = fluxoCriado.save({
                ignoreMandatoryFields: true
            });

            return true;

        })

        var testePush = 0;
        var arrayDatas = [];
        var dataMaior;
        var dataMenor;

        var mySearch = search.create({
            type: 'customrecord_lrc_fluxodepagamentos',
            filters: [['custrecord_lrc_linkfluxodepagamentos', 'IS', idContrato]],
            columns: ['custrecord_lrc_vencimento', 'internalId', 'isinactive']
        }).run().each(function (result) {

            var inativo = result.getValue("isinactive");

            if (inativo == false) {

                var idFluxo = result.getValue("internalId");
                var vencimento = result.getValue("custrecord_lrc_vencimento");


                var vencimentoSeparado = vencimento.split("/");
                dia = vencimentoSeparado[0];
                mes = vencimentoSeparado[1];
                ano = vencimentoSeparado[2];
                vencimento = ano + "-" + mes + "-" + dia + "T00:00"

                var dataAuxiliar = new Date(vencimento);

                var arrayAuxiliar = [{}];

                testePush = arrayDatas.push([
                    {
                        id: idFluxo,
                        vencimentoo: dataAuxiliar
                    }
                ]);
            }

            return true;

        })

        var arrayOrganizado = arrayDatas.sort(function (a, b) {

            return a[0].vencimentoo.getTime() - b[0].vencimentoo.getTime();
        });

        for (var i = 0; i < testePush; i++) {

            var numParcela = i + 1;

            var idFluxo = arrayOrganizado[i][0].id;

            var registroFluxo = record.load({
                type: "customrecord_lrc_fluxodepagamentos",
                id: idFluxo
            })

            registroFluxo.setValue({
                fieldId: "custrecord_lrc_numeroparcelac",
                value: numParcela
            })

            registroFluxo.save({
                ignoreMandatoryFields: true
            })
        }


    }

    return {
        pageInit: pageInit,
        substituiParcelas: substituiParcelas
    };
})