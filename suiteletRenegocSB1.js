/**
*@NApiVersion 2.x
*@NScriptType Suitelet
*
*/

define(['N/ui/serverWidget', 'N/search', 'N/log', 'N/record', 'N/currentRecord'], function (UI, search, log, record, currentRecord) {

  const onRequest = function (ctx) {

    const form = UI.createForm({
      title: "LRC @ Renegociação"
    });

    form.clientScriptModulePath = "./clientScriptRenegocSB1.js";

    registroAtual = ctx.newRecord;

    // Recuperando o ID do contrato na URL
    const parameters = ctx.request.parameters;
    const idContrato = parameters.idContrato;

    // Carregando o contrato no suitelet
    const contrato = record.load({
      type: "salesorder",
      id: idContrato
    })

    // Inicializa os custpages
    const sublistaParcelas = "custpage_rsc_parcelas";
    const idDadosGerais = "custpage_lrc_dadosgerais";

    // Recuperando variáveis do contrato para preenchimento
    const cliente = (contrato.getValue("entityname") == "" ? "VAZIO" : contrato.getValue("entityname"));
    const unidade = (contrato.getValue("custbody_rsc_tran_unidade") == "" ? "VAZIO" : contrato.getValue("custbody_rsc_tran_unidade"));
    const empreendimento = (contrato.getValue("custbody_rsc_projeto_obra_gasto_compra") == "" ? "VAZIO" : contrato.getValue("custbody_rsc_projeto_obra_gasto_compra"));
    const bloco = (contrato.getValue("custbody_rsc_bloco") == "" ? "VAZIO" : contrato.getValue("custbody_rsc_bloco"));
    const lineParcelas = contrato.getLineCount("custpage_rsc_parcelas");

    const idBotaoSimular = "custpage_lrc_simular"
    var botaoSimular = form.addButton({
      id: idBotaoSimular,
      label: "Simular",
      functionName: "simular"
    })

    const idBotaoSalvar = "custpage_lrc_salvar"
    var botaoSalvar = form.addButton({
      id: idBotaoSalvar,
      label: "Salvar",
      functionName: "salvar"
    })

    const idBotaoRedirect = "custpage_lrc_redirectrenegoc"
    var botaoRedirect = form.addButton({
      id: idBotaoRedirect,
      label: "Ir para a renegociação",
      functionName: "redirectRenegoc"
    })


    // Adiciona o Grupo de Campos "Dados Gerais"
    var dadosGerais = form.addFieldGroup({
      id: idDadosGerais,
      label: "Dados Gerais"
    })

    // Adicona os campos que estão em "Dados Gerais" preenchendo automaticamente
    form.addField({
      id: "custpage_lrc_contrato",
      type: UI.FieldType.TEXT,
      label: "Contrato",
      container: idDadosGerais
    }).updateDisplayType({
      displayType: UI.FieldDisplayType.DISABLED
    }).defaultValue = idContrato;

    form.addField({
      id: "custpage_lrc_spe",
      type: UI.FieldType.TEXT,
      label: "SPE",
      container: idDadosGerais
    }) // NECESSARIO ID DO CAMPO SPE

    form.addField({
      id: "custpage_lrc_bloco",
      type: UI.FieldType.TEXT,
      label: "Bloco",
      container: idDadosGerais
    }).updateDisplayType({
      displayType: UI.FieldDisplayType.DISABLED
    }).defaultValue = bloco;

    form.addField({
      id: "custpage_lrc_cliente",
      type: UI.FieldType.TEXT,
      label: "Cliente",
      container: idDadosGerais
    }).updateDisplayType({
      displayType: UI.FieldDisplayType.DISABLED
    }).defaultValue = cliente;

    form.addField({
      id: "custpage_lrc_empreendimento",
      type: UI.FieldType.TEXT,
      label: "Empreendimento",
      container: idDadosGerais
    }).updateDisplayType({
      displayType: UI.FieldDisplayType.DISABLED
    }).defaultValue = empreendimento;

    form.addField({
      id: "custpage_lrc_unidade",
      type: UI.FieldType.TEXT,
      label: "Unidade",
      container: idDadosGerais
    }).updateDisplayType({
      displayType: UI.FieldDisplayType.DISABLED
    }).defaultValue = unidade;

    // Adiciona o Grupo de Campos "Parâmetros"
    const idParametros = "custpage_lrc_parametros";
    var parametros = form.addFieldGroup({
      id: idParametros,
      label: "Parâmetros"
    })

    // Adicona os campos que estão em "Parâmetros"
    const listaRenegoc = form.addField({
      id: "custpage_lrc_tiporenegoc",
      type: UI.FieldType.SELECT,
      label: "Tipos de renegociação",
      container: idParametros
    })

    listaRenegoc.addSelectOption({ value: 0, text: "" });
    listaRenegoc.addSelectOption({ value: 1, text: "" });
    listaRenegoc.addSelectOption({ value: 2, text: "Amortização" });
    listaRenegoc.addSelectOption({ value: 3, text: "Recalculo de Atraso" });
    listaRenegoc.addSelectOption({ value: 4, text: "Adimplente" });
    listaRenegoc.addSelectOption({ value: 5, text: "Inadimplente" });

    const dataHoje = new Date();
    form.addField({
      id: "custpage_lrc_vecimentoinicial",
      type: UI.FieldType.DATE,
      label: "Vencimento Inicial",
      container: idParametros
    }).defaultValue = dataHoje;


    form.addField({
      id: "custpage_lrc_qtdparcelas",
      type: UI.FieldType.INTEGER,
      label: "Quantidade de Parcelas",
      container: idParametros
    })

    // Adiciona o Grupo de Campos "Parcelas"
    const idSubParcelas = "custpage_lrc_parcelas";
    var parcelas = form.addFieldGroup({
      id: idSubParcelas,
      label: "Parcelas"
    })

    // Adicona a sublista das parcelas relacionadas ao contrato selecionado
    const idSublista = "custpage_lrc_sublistaparcelas";
    const sublista = form.addSublist({
      id: idSublista,
      label: "Parcelas",
      type: UI.SublistType.INLINEEDITOR,
      container: idSubParcelas
    })

    // Cria as colunas da sublista

    const idSelecionar = "custpage_lrc_selecionar";
    sublista.addField({
      id: idSelecionar,
      label: "[ x ]",
      type: UI.FieldType.CHECKBOX
    })

    const numParcela = "custpage_lrc_numparcela"
    sublista.addField({
      id: numParcela,
      label: "#",
      type: UI.FieldType.INTEGER
    })

    const idParcela = "custpage_lrc_idparcela";
    sublista.addField({
      id: idParcela,
      label: "ID",
      type: UI.FieldType.TEXT
    }).updateDisplayType({
      displayType: UI.FieldDisplayType.HIDDEN
    })

    const idRenegociacao = "custpage_lrc_renegociacao";
    sublista.addField({
      id: idRenegociacao,
      label: "Renegociação",
      type: UI.FieldType.TEXT
    })

    const idFluxo = "custpage_lrc_idfluxopagamentos";
    sublista.addField({
      id: idFluxo,
      label: "ID Fluxo",
      type: UI.FieldType.TEXT
    })

    const idVencimento = "custpage_lrc_vencimento";
    sublista.addField({
      id: idVencimento,
      label: "Vencimento",
      type: UI.FieldType.DATE
    })

    const idTipo = "custpage_lrc_tipo";
    sublista.addField({
      id: idTipo,
      label: "Tipo parcela",
      type: UI.FieldType.TEXT
    })

    const idIndice = "custpage_lrc_indice";
    sublista.addField({
      id: idIndice,
      label: "Índice",
      type: UI.FieldType.TEXT
    })

    const idValor = "custpage_lrc_valor";
    sublista.addField({
      id: idValor,
      label: "Valor",
      type: UI.FieldType.FLOAT
    })

    const idMulta = "custpage_lrc_multa";
    sublista.addField({
      id: idMulta,
      label: "Multa",
      type: UI.FieldType.FLOAT
    })

    const idJuros = "custpage_lrc_juros";
    sublista.addField({
      id: idJuros,
      label: "Juros",
      type: UI.FieldType.FLOAT
    })

    const idValorTotal = "custpage_lrc_valortotal";
    sublista.addField({
      id: idValorTotal,
      label: "Valor Total",
      type: UI.FieldType.FLOAT
    })

    const objColunaFluxo = sublista.getField({
      id: idFluxo
    })

    const objColunaTipo = sublista.getField({
      id: idTipo
    })

    const objColunaIndice = sublista.getField({
      id: idIndice
    })

    objColunaFluxo.updateDisplayType({
      displayType: UI.FieldDisplayType.HIDDEN
    })

    objColunaTipo.updateDisplayType({
      displayType: UI.FieldDisplayType.DISABLED
    })

    objColunaIndice.updateDisplayType({
      displayType: UI.FieldDisplayType.DISABLED
    })

    const idContainerParcelasSelecionadas = "custpage_lrc_containerparcelasselecionadas"
    const containerParcelasSelecionadas = form.addFieldGroup({
      id: idContainerParcelasSelecionadas,
      label: "Parcelas Selecionadas"
    })

    const idSublistaParcelasSelecionadas = "custpage_lrc_sublistaparcelasselecionadas"
    const sublistaParcelasSelecionadas = form.addSublist({
      id: idSublistaParcelasSelecionadas,
      label: "Parcelas Selecionadas",
      type: UI.SublistType.INLINEEDITOR,
      container: idContainerParcelasSelecionadas
    })

    const idNumParcela = "custpage_lrc_colunanumparcela"
    sublistaParcelasSelecionadas.addField({
      id: idNumParcela,
      label: "#",
      type: UI.FieldType.TEXT
    })

    sublistaParcelasSelecionadas.addField({
      id: idFluxo,
      label: "ID Fluxo",
      type: UI.FieldType.INTEGER
    })

    const objColunaFluxoSelecionada = sublistaParcelasSelecionadas.getField({
      id: idFluxo
    })

    objColunaFluxoSelecionada.updateDisplayType({
      displayType: UI.FieldDisplayType.HIDDEN
    })

    const idDataVencimento = "custpage_lrc_colunadatavencimento"
    sublistaParcelasSelecionadas.addField({
      id: idDataVencimento,
      label: "Data Vencimento",
      type: UI.FieldType.DATE
    })

    const idValorParcela = "custpage_lrc_colunavalorparcela"
    sublistaParcelasSelecionadas.addField({
      id: idValorParcela,
      label: "Valor Parcela",
      type: UI.FieldType.FLOAT
    })

    const idTipoParcela = "custpage_lrc_colunatipoparcela"
    sublistaParcelasSelecionadas.addField({
      id: idTipoParcela,
      label: "Tipo Parcela",
      type: UI.FieldType.TEXT
    })

    const idIndiceParcela = "custpage_lrc_colunaindiceparcela"
    sublistaParcelasSelecionadas.addField({
      id: idIndiceParcela,
      label: "Índice",
      type: UI.FieldType.TEXT
    })

    const idProRata = "custpage_lrc_colunaprorata"
    sublistaParcelasSelecionadas.addField({
      id: idProRata,
      label: "(+) Pro Rata",
      type: UI.FieldType.FLOAT
    })

    const idJurosTP = "custpage_lrc_colunajurostp"
    sublistaParcelasSelecionadas.addField({
      id: idJurosTP,
      label: "(+) Juros T.P.",
      type: UI.FieldType.FLOAT
    })

    const idValorTotalSelecionada = "custpage_lrc_colunavalortotal"
    sublistaParcelasSelecionadas.addField({
      id: idValorTotalSelecionada,
      label: "Valor Total",
      type: UI.FieldType.FLOAT
    })

    const idContainerNovasParcelas = "custpage_lrc_containernovasparcelas"
    const containerNovasParcelas = form.addFieldGroup({
      id: idContainerNovasParcelas,
      label: "Novas Parcelas"
    })

    const idSublistaNovasParcelas = "custpage_lrc_sublistanovasparcelas"
    const sublistaNovasParcelas = form.addSublist({
      id: idSublistaNovasParcelas,
      label: "Novas Parcelas",
      type: UI.SublistType.INLINEEDITOR,
      container: idContainerNovasParcelas
    })

    const idNovoNumParcela = "custpage_lrc_colunanovonumparcela"
    sublistaNovasParcelas.addField({
      id: idNovoNumParcela,
      label: "#",
      type: UI.FieldType.INTEGER
    })

    const idNovaDataVencimento = "custpage_lrc_colunanovadatavencimento"
    sublistaNovasParcelas.addField({
      id: idNovaDataVencimento,
      label: "Data Vencimento",
      type: UI.FieldType.DATE
    })

    const idNovoValorParcela = "custpage_lrc_colunanovovalorparcela"
    sublistaNovasParcelas.addField({
      id: idNovoValorParcela,
      label: "Valor Parcela",
      type: UI.FieldType.FLOAT
    })

    const idNovoTipoParcela = "custpage_lrc_colunanovotipoparcela"
    sublistaNovasParcelas.addField({
      id: idNovoTipoParcela,
      label: "Tipo Parcela",
      type: UI.FieldType.TEXT
    })

    const idNovoIndiceParcela = "custpage_lrc_colunanovoindiceparcela"
    sublistaNovasParcelas.addField({
      id: idNovoIndiceParcela,
      label: "Índice",
      type: UI.FieldType.TEXT
    })

    const idNovaProRata = "custpage_lrc_colunanovaprorata"
    sublistaNovasParcelas.addField({
      id: idNovaProRata,
      label: "(+) Pro Rata",
      type: UI.FieldType.FLOAT
    })

    const idNovoJurosTP = "custpage_lrc_colunanovojurostp"
    sublistaNovasParcelas.addField({
      id: idNovoJurosTP,
      label: "(+) Juros T.P.",
      type: UI.FieldType.FLOAT
    })

    const idNovoValorTotalSelecionada = "custpage_lrc_colunanovovalortotal"
    sublistaNovasParcelas.addField({
      id: idNovoValorTotalSelecionada,
      label: "Valor Total",
      type: UI.FieldType.FLOAT
    })


    ctx.response.writePage(form);
  }

  return {
    onRequest: onRequest
  };
})