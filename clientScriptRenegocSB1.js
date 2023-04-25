/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */
define(['N/currentRecord', 'N/url', 'N/record', 'N/search'], function (currentRecord, url, record, search) {

    function pageInit(scriptContext) {

    }

    function fieldChanged(ctx) {
        var registro = currentRecord.get();
        var registroAtual = ctx.currentRecord;
        var fieldID = ctx.fieldId;

        // Checha o campo que mudou de valor
        if (fieldID == "custpage_lrc_tiporenegoc") {

            // exclui as linhas adicionadas anteriormente pelas outras opções
            var total_linhas_parcelas = registroAtual.getLineCount({ sublistId: "custpage_lrc_sublistaparcelas" });

            for (var i = 0; i < total_linhas_parcelas; i++) {
                registro.removeLine({ sublistId: "custpage_lrc_sublistaparcelas", line: 0 });
            }

            // Checha qual das funções serão utilizadas no processo de selecção das parcelas
            const tipoRenegoc = registroAtual.getValue("custpage_lrc_tiporenegoc");
            switch (tipoRenegoc) {
                case "2":
                    amortizacao();
                    break;
                case "3":
                    alert("em desenvolvimento");
                    break;
                case "4":
                    adimplente();
                    break;
                case "5":
                    alert("em desenvolvimento");
                    break;
                default:
                    break;
            }
        }
    }

    function adimplente() {

        var somaValorTotal = 0;
        var somaValor = 0;
        var somaJuros = 0;
        var somaMulta = 0;
        var contFluxo = 0;
        const registroAtual = currentRecord.get();
        const idContrato = registroAtual.getValue("custpage_lrc_contrato");

        const dataHoje = new Date();

        const sublistaParcelasContrato = "custpage_rsc_parcelas";
        const sublistaParcelasRenegoc = "custpage_lrc_sublistaparcelas";
        var vencimento;
        var contInad = 0;

        search.create({
            type: 'customrecord_lrc_fluxodepagamentos',
            filters: [['custrecord_lrc_linkfluxodepagamentos', 'IS', idContrato]],
        }).run().each(function (result) {
            contFluxo++;
            return true;
        })

        search.create({
            type: 'customrecord_lrc_fluxodepagamentos',
            filters: [['custrecord_lrc_linkfluxodepagamentos', 'IS', idContrato]],
            columns: ['custrecord_lrc_vencimento']
        }).run().each(function (result) {

            vencimento = result.getValue("custrecord_lrc_vencimento");

            if (vencimento > dataHoje) {
                contInad++;
            }

            return true;
        })

        var i = 1;

        search.create({
            type: 'customrecord_lrc_fluxodepagamentos',
            filters: [['custrecord_lrc_linkfluxodepagamentos', 'IS', idContrato]],
            columns: ['internalId']
        }).run().each(function (result) {

            const idFluxo = result.getValue("internalId");

            var registroFluxo = record.load({
                type: "customrecord_lrc_fluxodepagamentos",
                id: idFluxo
            })

            if (contInad <= 0) {

                var statusParcela = registroFluxo.getValue("custrecord_lrc_statusparcela");

                var inativo = registroFluxo.getValue("isinactive")

                vencimento = registroFluxo.getValue("custrecord_lrc_vencimento");

                if (statusParcela == 1 && vencimento >= dataHoje && inativo == false) {

                    var parcelaVer = registroFluxo.getValue("custrecord_lrc_ver");

                    var faturaID;
                    var mySalesOrderSearch = search.create({
                        type: "invoice",
                        columns: ["internalid"],
                        filters: ["tranid", "IS", parcelaVer]
                    });
                    mySalesOrderSearch.run().each(function (registroFluxo) {
                        faturaID = registroFluxo.getValue("internalid");
                        return true;
                    });

                    if (faturaID == undefined) {
                        faturaID = 0;
                    }

                    var tipoParcela = registroFluxo.getValue("custrecord_lrc_tipo");

                    var indiceParcela = registroFluxo.getValue("custrecord_lrc_indice");

                    var valorOriginal = registroFluxo.getValue("custrecord_lrc_valororiginal");

                    var valorAtualizado = registroFluxo.getValue("custrecord_lrc_valoratualizadoc");

                    var multa = registroFluxo.getValue("custrecord_lrc_multac");

                    var juros = registroFluxo.getValue("custrecord_lrc_jurosc");

                    registroAtual.selectNewLine({
                        sublistId: sublistaParcelasRenegoc,
                    });

                    registroAtual.setCurrentSublistValue({
                        sublistId: sublistaParcelasRenegoc,
                        fieldId: "custpage_lrc_idfluxopagamentos",
                        value: idFluxo
                    });

                    registroAtual.setCurrentSublistValue({
                        sublistId: sublistaParcelasRenegoc,
                        fieldId: "custpage_lrc_numparcela",
                        value: i++
                    });

                    registroAtual.setCurrentSublistValue({
                        sublistId: sublistaParcelasRenegoc,
                        fieldId: "custpage_lrc_idparcela",
                        value: faturaID
                    });

                    registroAtual.setCurrentSublistValue({
                        sublistId: sublistaParcelasRenegoc,
                        fieldId: "custpage_lrc_renegociacao",
                        value: "Não Renegociado"
                    });

                    registroAtual.setCurrentSublistValue({
                        sublistId: sublistaParcelasRenegoc,
                        fieldId: "custpage_lrc_vencimento",
                        value: vencimento
                    });

                    registroAtual.setCurrentSublistValue({
                        sublistId: sublistaParcelasRenegoc,
                        fieldId: "custpage_lrc_tipo",
                        value: tipoParcela
                    });

                    registroAtual.setCurrentSublistValue({
                        sublistId: sublistaParcelasRenegoc,
                        fieldId: "custpage_lrc_indice",
                        value: indiceParcela
                    });

                    registroAtual.setCurrentSublistValue({
                        sublistId: sublistaParcelasRenegoc,
                        fieldId: "custpage_lrc_valor",
                        value: valorOriginal
                    });

                    registroAtual.setCurrentSublistValue({
                        sublistId: sublistaParcelasRenegoc,
                        fieldId: "custpage_lrc_juros",
                        value: juros
                    });

                    registroAtual.setCurrentSublistValue({
                        sublistId: sublistaParcelasRenegoc,
                        fieldId: "custpage_lrc_multa",
                        value: multa
                    });

                    registroAtual.setCurrentSublistValue({
                        sublistId: sublistaParcelasRenegoc,
                        fieldId: "custpage_lrc_valortotal",
                        value: valorAtualizado
                    });

                    somaValorTotal += valorAtualizado;
                    somaValor += valorOriginal;
                    somaJuros += juros;
                    somaMulta += multa;

                    registroAtual.commitLine({
                        sublistId: sublistaParcelasRenegoc
                    });

                }

            } else {
                alert("Tipo de renegociação indisponível para contratos INADIMPLENTES");
                registroAtual.setValue({
                    fieldId: "custpage_lrc_tiporenegoc",
                    value: 0
                })
            }

            contFluxo++;
            return true;
        })

        // Linha com a somatória das parcelas
        registroAtual.selectNewLine({
            sublistId: sublistaParcelasRenegoc,
        });
        registroAtual.setCurrentSublistValue({
            sublistId: sublistaParcelasRenegoc,
            fieldId: "custpage_lrc_valor",
            value: somaValor
        });
        registroAtual.setCurrentSublistValue({
            sublistId: sublistaParcelasRenegoc,
            fieldId: "custpage_lrc_juros",
            value: somaJuros
        });
        // registroAtual.setCurrentSublistValue({
        //     sublistId: sublistaParcelasRenegoc,
        //     fieldId: "custpage_lrc_multa",
        //     value: somaMulta
        // });
        registroAtual.setCurrentSublistValue({
            sublistId: sublistaParcelasRenegoc,
            fieldId: "custpage_lrc_valortotal",
            value: somaValorTotal
        });
        registroAtual.commitLine({
            sublistId: sublistaParcelasRenegoc
        });

    }

    function amortizacao() {
        adimplente();
    }

    function simular() {
        const registroAtual = currentRecord.get();
        const qtdParcelas = registroAtual.getValue("custpage_lrc_qtdparcelas");
        const tipo = registroAtual.getValue("custpage_lrc_tiporenegoc");
        if (qtdParcelas != "") {
            if (tipo != 0) {

                const sublistaParcelasRenegoc = "custpage_lrc_sublistaparcelas";
                const idSublistaParcelasSelecionadas = "custpage_lrc_sublistaparcelasselecionadas";
                const idSublistaNovasParcelas = "custpage_lrc_sublistanovasparcelas"

                var somaValorTotal = 0;
                var somaValor = 0;
                var somaJuros = 0;
                var somaMulta = 0;

                // remove as linhas anteriormente adicionadas em Parcelas Selecionadas
                var total_linhas_parcelasSelecionadas = registroAtual.getLineCount({ sublistId: idSublistaParcelasSelecionadas });
                for (var i = 0; i < total_linhas_parcelasSelecionadas; i++) {
                    registroAtual.removeLine({ sublistId: idSublistaParcelasSelecionadas, line: 0 });
                }

                // remove as linhas anteriormente adicionadas em Novas Parcelas
                var total_linhas_novasParcelas = registroAtual.getLineCount({ sublistId: idSublistaNovasParcelas });
                for (var i = 0; i < total_linhas_novasParcelas; i++) {
                    registroAtual.removeLine({ sublistId: idSublistaNovasParcelas, line: 0 });
                }

                var numParcela = 1;

                var contSelecionadas = 0;

                var valorNovaParcela = 0;
                var valorTotalNovaParcela = 0;

                var data = registroAtual.getValue("custpage_lrc_vecimentoinicial");

                var vencimentoInicial = new Date(data);
                vencimentoInicial.setDate(vencimentoInicial.getDate() + 10);

                dia = vencimentoInicial.getDate();
                mes = vencimentoInicial.getMonth() + 1;
                if (dia < 10) {
                    dia = "0" + dia;
                }
                if (mes < 10) {
                    mes = "0" + mes;
                }
                stringDataFormatada = mes + "/" + dia + "/" + vencimentoInicial.getFullYear();
                vencimento = new Date(stringDataFormatada);


                // verifica as parcelas selecionadas
                const lineParcelas = registroAtual.getLineCount(sublistaParcelasRenegoc) - 1;
                for (var i = 0; i < lineParcelas; i++) {

                    var selecionado = registroAtual.getSublistValue({
                        sublistId: sublistaParcelasRenegoc,
                        fieldId: "custpage_lrc_selecionar",
                        line: i
                    })

                    // verifica se a parcela ja foi renegociada
                    var flagRenegoc = registroAtual.getSublistValue({
                        sublistId: sublistaParcelasRenegoc,
                        fieldId: "custpage_lrc_selecionar",
                        line: i
                    })

                    if (selecionado == true) {
                        contSelecionadas++;

                        var idFluxo = registroAtual.getSublistValue({
                            sublistId: sublistaParcelasRenegoc,
                            fieldId: "custpage_lrc_idfluxopagamentos",
                            line: i
                        })

                        var idFatura = registroAtual.getSublistValue({
                            sublistId: sublistaParcelasRenegoc,
                            fieldId: "custpage_lrc_idparcela",
                            line: i
                        })

                        var vencimentoOriginal = registroAtual.getSublistValue({
                            sublistId: sublistaParcelasRenegoc,
                            fieldId: "custpage_lrc_vencimento",
                            line: i
                        })

                        var valorOriginal = registroAtual.getSublistValue({
                            sublistId: sublistaParcelasRenegoc,
                            fieldId: "custpage_lrc_valor",
                            line: i
                        })

                        var tipoParcela = registroAtual.getSublistValue({
                            sublistId: sublistaParcelasRenegoc,
                            fieldId: "custpage_lrc_tipo",
                            line: i
                        })

                        var indiceParcela = registroAtual.getSublistValue({
                            sublistId: sublistaParcelasRenegoc,
                            fieldId: "custpage_lrc_indice",
                            line: i
                        })

                        var juros = registroAtual.getSublistValue({
                            sublistId: sublistaParcelasRenegoc,
                            fieldId: "custpage_lrc_juros",
                            line: i
                        })

                        var valorTotal = registroAtual.getSublistValue({
                            sublistId: sublistaParcelasRenegoc,
                            fieldId: "custpage_lrc_valortotal",
                            line: i
                        })

                        registroAtual.selectNewLine({
                            sublistId: idSublistaParcelasSelecionadas,
                        });

                        registroAtual.setCurrentSublistValue({
                            sublistId: idSublistaParcelasSelecionadas,
                            fieldId: "custpage_lrc_idfluxopagamentos",
                            value: idFluxo
                        });

                        registroAtual.setCurrentSublistValue({
                            sublistId: idSublistaParcelasSelecionadas,
                            fieldId: "custpage_lrc_colunanumparcela",
                            value: i + 1
                        });

                        registroAtual.setCurrentSublistValue({
                            sublistId: idSublistaParcelasSelecionadas,
                            fieldId: "custpage_lrc_colunadatavencimento",
                            value: vencimentoOriginal
                        });

                        registroAtual.setCurrentSublistValue({
                            sublistId: idSublistaParcelasSelecionadas,
                            fieldId: "custpage_lrc_colunavalorparcela",
                            value: valorOriginal
                        });

                        registroAtual.setCurrentSublistValue({
                            sublistId: idSublistaParcelasSelecionadas,
                            fieldId: "custpage_lrc_colunatipoparcela",
                            value: tipoParcela
                        });

                        registroAtual.setCurrentSublistValue({
                            sublistId: idSublistaParcelasSelecionadas,
                            fieldId: "custpage_lrc_colunaindiceparcela",
                            value: indiceParcela
                        });

                        registroAtual.setCurrentSublistValue({
                            sublistId: idSublistaParcelasSelecionadas,
                            fieldId: "custpage_lrc_colunajurostp",
                            value: juros
                        });

                        registroAtual.setCurrentSublistValue({
                            sublistId: idSublistaParcelasSelecionadas,
                            fieldId: "custpage_lrc_colunavalortotal",
                            value: valorTotal
                        });

                        registroAtual.commitLine({
                            sublistId: idSublistaParcelasSelecionadas
                        });

                        somaValorTotal += valorTotal;
                        somaValor += valorOriginal;
                        somaJuros += juros;

                        numParcela++;
                    }
                }

                if (contSelecionadas > 0) {

                    registroAtual.selectNewLine({
                        sublistId: idSublistaParcelasSelecionadas,
                    });
                    registroAtual.setCurrentSublistValue({
                        sublistId: idSublistaParcelasSelecionadas,
                        fieldId: "custpage_lrc_colunavalorparcela",
                        value: somaValor
                    });
                    registroAtual.setCurrentSublistValue({
                        sublistId: idSublistaParcelasSelecionadas,
                        fieldId: "custpage_lrc_colunajurostp",
                        value: somaJuros
                    });
                    // registroAtual.setCurrentSublistValue({
                    //     sublistId: idSublistaParcelasSelecionadas,
                    //     fieldId: "custpage_lrc_multa",
                    //     value: somaMulta
                    // });
                    registroAtual.setCurrentSublistValue({
                        sublistId: idSublistaParcelasSelecionadas,
                        fieldId: "custpage_lrc_colunavalortotal",
                        value: somaValorTotal
                    });
                    registroAtual.commitLine({
                        sublistId: idSublistaParcelasSelecionadas
                    });

                    valorNovaParcela = somaValor / qtdParcelas;
                    valorTotalNovaParcela = somaValorTotal / qtdParcelas;

                    numParcela = 1;
                    somaValor = 0;
                    somaJuros = 0;
                    somaValorTotal = 0;

                    for (var i = 0; i < qtdParcelas; i++) {

                        registroAtual.selectNewLine({
                            sublistId: idSublistaNovasParcelas,
                        })

                        registroAtual.setCurrentSublistValue({
                            sublistId: idSublistaNovasParcelas,
                            fieldId: "custpage_lrc_colunanovonumparcela",
                            value: numParcela
                        });

                        if (i > 0) {
                            vencimento.setDate(vencimento.getDate() + 30);
                        }

                        registroAtual.setCurrentSublistValue({
                            sublistId: idSublistaNovasParcelas,
                            fieldId: "custpage_lrc_colunanovadatavencimento",
                            value: vencimento
                        });

                        registroAtual.setCurrentSublistValue({
                            sublistId: idSublistaNovasParcelas,
                            fieldId: "custpage_lrc_colunanovovalorparcela",
                            value: valorNovaParcela
                        });

                        registroAtual.setCurrentSublistValue({
                            sublistId: idSublistaNovasParcelas,
                            fieldId: "custpage_lrc_colunanovotipoparcela",
                            value: tipoParcela
                        });

                        registroAtual.setCurrentSublistValue({
                            sublistId: idSublistaNovasParcelas,
                            fieldId: "custpage_lrc_colunanovoindiceparcela",
                            value: indiceParcela
                        });

                        registroAtual.setCurrentSublistValue({
                            sublistId: idSublistaNovasParcelas,
                            fieldId: "custpage_lrc_colunanovojurostp",
                            value: juros
                        });

                        registroAtual.setCurrentSublistValue({
                            sublistId: idSublistaNovasParcelas,
                            fieldId: "custpage_lrc_colunanovovalortotal",
                            value: valorTotalNovaParcela
                        });

                        registroAtual.commitLine({
                            sublistId: idSublistaNovasParcelas

                        });

                        somaValor += valorNovaParcela;
                        somaValorTotal += valorTotalNovaParcela;
                        somaJuros += juros;

                        numParcela++;
                    }

                    registroAtual.selectNewLine({
                        sublistId: idSublistaNovasParcelas,
                    });
                    registroAtual.setCurrentSublistValue({
                        sublistId: idSublistaNovasParcelas,
                        fieldId: "custpage_lrc_colunanovovalorparcela",
                        value: somaValor
                    });
                    registroAtual.setCurrentSublistValue({
                        sublistId: idSublistaNovasParcelas,
                        fieldId: "custpage_lrc_colunanovojurostp",
                        value: somaJuros
                    });
                    // registroAtual.setCurrentSublistValue({
                    //     sublistId: idSublistaNovasParcelas,
                    //     fieldId: "custpage_lrc_multa",
                    //     value: somaMulta
                    // });
                    registroAtual.setCurrentSublistValue({
                        sublistId: idSublistaNovasParcelas,
                        fieldId: "custpage_lrc_colunanovovalortotal",
                        value: somaValorTotal
                    });
                    registroAtual.commitLine({
                        sublistId: idSublistaNovasParcelas
                    });

                    alert("Parcelas simuladas com sucesso, favor consultar sublista 'Novas Parcelas' para análise!");
                } else {
                    alert("Selecione ao menos uma parcela para simular a renegociação!");
                }
            } else {
                alert("Insira o tipo de renegociação a ser feita!");
            }
        } else {
            alert("Insira a quantidade de novas parcelas!");
        }
    }

    function salvar() {
        const registroAtual = currentRecord.get();
        const registroSalvoRenegoc = record.create({
            type: "customrecord_lrc_renegociacao"
        });

        const registroSalvoSublistaParcelas = record.create({
            type: "customrecord_lrc_sublistaparcelasrenegoc"
        });

        const registroSalvoSublistaNovasParcelas = record.create({
            type: "customrecord_lrc_sublistanovasparcelas"
        });

        const idSublistaParcelasSelecionadas = "custpage_lrc_sublistaparcelasselecionadas";
        const idSublistaNovasParcelas = "custpage_lrc_sublistanovasparcelas";
        const qtdParcelas = registroAtual.getValue("custpage_lrc_qtdparcelas");

        const lineParcelas = registroAtual.getLineCount(idSublistaParcelasSelecionadas) - 1;

        var tipo = 0;

        const contrato = registroAtual.getValue("custpage_lrc_contrato");
        const cliente = registroAtual.getValue("custpage_lrc_cliente");
        const spe = registroAtual.getValue("custpage_lrc_spe");
        const empreendimento = registroAtual.getValue("custpage_lrc_empreendimento");
        const bloco = registroAtual.getValue("custpage_lrc_bloco");
        const unidade = registroAtual.getValue("custpage_lrc_unidade");
        tipo = registroAtual.getValue("custpage_lrc_tiporenegoc");
        const dataInicial = registroAtual.getValue("custpage_lrc_vecimentoinicial");

        // setando valores da renegociação
        registroSalvoRenegoc.setValue({
            fieldId: "custrecord_lrc_contratorenegociacao",
            value: contrato
        })

        registroSalvoRenegoc.setValue({
            fieldId: "custrecord_lrc_clienterenegociacao",
            value: cliente
        })

        registroSalvoRenegoc.setValue({
            fieldId: "custrecord_lrc_blocorenegociacao",
            value: bloco
        })

        registroSalvoRenegoc.setValue({
            fieldId: "custrecord_lrc_empreendrenegociacao",
            value: empreendimento
        })

        registroSalvoRenegoc.setValue({
            fieldId: "custrecord_lrc_sperenegociacao",
            value: spe
        })

        registroSalvoRenegoc.setValue({
            fieldId: "custrecord_lrc_unidaderenegociacao",
            value: unidade
        })

        registroSalvoRenegoc.setValue({
            fieldId: "custrecord_lrc_tiporenegoc",
            value: tipo++
        })

        registroSalvoRenegoc.setValue({
            fieldId: "custrecord_lrc_datainicial",
            value: dataInicial
        })

        const idRenegoc = registroSalvoRenegoc.save({
            ignoreMandatoryFields: true
        });

        // setando valores da sublista
        for (var i = 0; i < lineParcelas; i++) {

            var tipoParcela = registroAtual.getSublistValue({
                sublistId: idSublistaParcelasSelecionadas,
                fieldId: "custpage_lrc_colunatipoparcela",
                line: i
            })

            var idFluxo = registroAtual.getSublistValue({
                sublistId: idSublistaParcelasSelecionadas,
                fieldId: "custpage_lrc_idfluxopagamentos",
                line: i
            })

            var id = registroAtual.getSublistValue({
                sublistId: idSublistaParcelasSelecionadas,
                fieldId: "custpage_lrc_colunanumparcela",
                line: i
            })

            if (id == 0) {
                id = "";
            }

            var vencimento = registroAtual.getSublistValue({
                sublistId: idSublistaParcelasSelecionadas,
                fieldId: "custpage_lrc_colunadatavencimento",
                line: i
            })

            var valorOriginal = registroAtual.getSublistValue({
                sublistId: idSublistaParcelasSelecionadas,
                fieldId: "custpage_lrc_colunavalorparcela",
                line: i
            })

            var indice = registroAtual.getSublistValue({
                sublistId: idSublistaParcelasSelecionadas,
                fieldId: "custpage_lrc_colunaindiceparcela",
                line: i
            })

            var prorata = registroAtual.getSublistValue({
                sublistId: idSublistaParcelasSelecionadas,
                fieldId: "custpage_lrc_colunaprorata",
                line: i
            })

            var juros = registroAtual.getSublistValue({
                sublistId: idSublistaParcelasSelecionadas,
                fieldId: "custpage_lrc_colunajurostp",
                line: i
            })

            var valorTotal = registroAtual.getSublistValue({
                sublistId: idSublistaParcelasSelecionadas,
                fieldId: "custpage_lrc_colunavalortotal",
                line: i
            })

            // setando valores da sublista

            registroSalvoSublistaParcelas.setValue({
                fieldId: "custrecord_lrc_ordemparcela",
                value: i + 1
            });

            registroSalvoSublistaParcelas.setValue({
                fieldId: "custrecord_lrc_idfluxodepagamentos",
                value: idFluxo
            });

            registroSalvoSublistaParcelas.setValue({
                fieldId: "custrecord_lrc_linksublista",
                value: idRenegoc
            });

            registroSalvoSublistaParcelas.setValue({
                fieldId: "custrecord_lrc_ordemparcela",
                value: id
            });

            registroSalvoSublistaParcelas.setValue({
                fieldId: "custrecord_lrc_vencimentoparcela",
                value: vencimento
            });

            registroSalvoSublistaParcelas.setValue({
                fieldId: "custrecord_lrc_valororiginalparcela",
                value: valorOriginal
            })

            registroSalvoSublistaParcelas.setValue({
                fieldId: "custrecord_lrc_tipoparcelac",
                value: tipoParcela
            })

            registroSalvoSublistaParcelas.setValue({
                fieldId: "custrecord_lrc_indiceparcela",
                value: indice
            })

            registroSalvoSublistaParcelas.setValue({
                fieldId: "custrecord_lrc_prorataparcela",
                value: prorata
            })

            registroSalvoSublistaParcelas.setValue({
                fieldId: "custrecord_lrc_jurostpparcela",
                value: juros
            })

            registroSalvoSublistaParcelas.setValue({
                fieldId: "custrecord_lrc_valortotalparcela",
                value: valorTotal
            })

            registroSalvoSublistaParcelas.save({
                ignoreMandatoryFields: true
            })
        }

        var valorTotal = 0;

        for (var i = 0; i < qtdParcelas; i++) {

            var tipoParcela = registroAtual.getSublistValue({
                sublistId: idSublistaNovasParcelas,
                fieldId: "custpage_lrc_colunanovotipoparcela",
                line: i
            })

            var id = registroAtual.getSublistValue({
                sublistId: idSublistaNovasParcelas,
                fieldId: "custpage_lrc_colunanovonumparcela",
                line: i
            });

            var vencimento = registroAtual.getSublistValue({
                sublistId: idSublistaNovasParcelas,
                fieldId: "custpage_lrc_colunanovadatavencimento",
                line: i
            });

            var valorOriginal = registroAtual.getSublistValue({
                sublistId: idSublistaNovasParcelas,
                fieldId: "custpage_lrc_colunanovovalorparcela",
                line: i
            });

            var indice = registroAtual.getSublistValue({
                sublistId: idSublistaNovasParcelas,
                fieldId: "custpage_lrc_colunanovoindiceparcela",
                line: i
            });

            var prorata = registroAtual.getSublistValue({
                sublistId: idSublistaNovasParcelas,
                fieldId: "custpage_lrc_colunanovaprorata",
                line: i
            });

            var juros = registroAtual.getSublistValue({
                sublistId: idSublistaNovasParcelas,
                fieldId: "custpage_lrc_colunanovojurostp",
                line: i
            });

            valorTotal = registroAtual.getSublistValue({
                sublistId: idSublistaNovasParcelas,
                fieldId: "custpage_lrc_colunanovovalortotal",
                line: i
            });

            registroSalvoSublistaNovasParcelas.setValue({
                fieldId: "custrecord_lrc_linksubnovasparcelas",
                value: idRenegoc
            });

            registroSalvoSublistaNovasParcelas.setValue({
                fieldId: "custrecord_lrc_idnovaparcelac",
                value: i + 1
            });

            registroSalvoSublistaNovasParcelas.setValue({
                fieldId: "custrecordlrc_vencimentonovaparcela",
                value: vencimento
            });

            registroSalvoSublistaNovasParcelas.setValue({
                fieldId: "custrecord_lrc_valororiginanovalparcela",
                value: valorOriginal
            });

            console.log("vencimento nova parcela", vencimento);

            registroSalvoSublistaNovasParcelas.setValue({
                fieldId: "custrecord_lrc_tiponovaparcela",
                value: tipoParcela
            });

            registroSalvoSublistaNovasParcelas.setValue({
                fieldId: "custrecordlrc_indicenovaparcela",
                value: indice
            });

            registroSalvoSublistaNovasParcelas.setValue({
                fieldId: "custrecord_lrc_proratanovaparcela",
                value: prorata
            });

            registroSalvoSublistaNovasParcelas.setValue({
                fieldId: "custrecord_lrc_jurostpnovaparcela",
                value: juros
            });

            registroSalvoSublistaNovasParcelas.setValue({
                fieldId: "custrecord_lrc_valoratualizadonovaparcel",
                value: valorTotal
            });

            registroSalvoSublistaNovasParcelas.save({
                ignoreMandatoryFields: true
            });
        }

        const registroRenegoc = record.load({
            type: "customrecord_lrc_renegociacao",
            id: idRenegoc
        })

        registroRenegoc.setValue({
            fieldId: "custrecord_lrc_valortotal",
            value: valorTotal * qtdParcelas
        })

        registroRenegoc.setValue({
            fieldId: "custrecord_lrc_statusrenegoc",
            value: 5
        })

        registroRenegoc.save();

        alert("Registro de renegociação criado com sucesso!");

        redirectRenegoc(idRenegoc);
    }

    function redirectRenegoc(idRenegoc){

        var output = url.resolveRecord({
            recordType: 'customrecord_lrc_renegociacao',
            recordId: idRenegoc,
            isEditMode: false
        });

        window.location.replace(output);

    }

    return {
        pageInit: pageInit,
        fieldChanged: fieldChanged,
        adimplente: adimplente,
        amortizacao: amortizacao,
        simular: simular,
        salvar: salvar
    };

});