const vscode = require("vscode");
const l10n = vscode.l10n;

/**
 * @function mostrarStatusBarMensagem
 * @description Exibe uma mensagem temporária na barra de status.
 * @param {string} mensagem - A mensagem a ser exibida.
 */
function mostrarStatusBarMensagem(mensagem) {
  const statusBarMessage = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Left,
    100
  );
  statusBarMessage.text = mensagem;
  statusBarMessage.show();

  setTimeout(() => {
    statusBarMessage.dispose(); // Remove a mensagem da barra de status após 1 segundo
  }, 1000); // 1000 milissegundos = 1 segundo
}

/**
 * @function alterarTextoSelecionado
 * @description Modifica o texto selecionado no editor ativo.
 * @param {vscode.TextEditor} editor - O editor de texto ativo.
 * @param {Function} modificarTexto - Função que altera o texto selecionado.
 */
function alterarTextoSelecionado(editor, modificarTexto) {
  const selecao = editor.selection;
  const texto = editor.document.getText(selecao);

  if (texto) {
    const textoModificado = modificarTexto(texto);
    editor
      .edit((editBuilder) => {
        editBuilder.replace(selecao, textoModificado);
      })
      .then(() => {
        // Mostra a mensagem de sucesso na barra de status
        mostrarStatusBarMensagem(l10n.t("conversionSuccess"));
      });
  }
}

/**
 * @function capitalize
 * @description Capitaliza a primeira letra de uma palavra e coloca o restante em minúsculas.
 * @param {string} palavra - A palavra a ser capitalizada.
 * @returns {string} - A palavra capitalizada.
 */
function capitalize(palavra) {
  return (
    palavra.charAt(0).toLocaleUpperCase("pt-BR") +
    palavra.slice(1).toLocaleLowerCase("pt-BR")
  );
}

/**
 * @function convertToCamelCase
 * @description Converte um texto de underscore para camel case.
 * @param {string} texto - O texto a ser convertido.
 * @returns {string} - O texto convertido para camel case.
 */
function convertToCamelCase(texto) {
  return texto
    .toLowerCase()
    .replace(/_([a-zà-ÿ])/g, (match, letra) => letra.toUpperCase());
}

/**
 * @function convertToUnderscore
 * @description Converte um texto de camel case para underscore.
 * @param {string} texto - O texto a ser convertido.
 * @returns {string} - O texto convertido para underscore.
 */
function convertToUnderscore(texto) {
  return texto.replace(/([a-zà-ÿ])([A-Z])/g, "$1_$2").toLowerCase();
}

/**
 * @function activate
 * @description Função que é executada quando a extensão é ativada.
 * @param {vscode.ExtensionContext} context - Contexto da extensão.
 */
function activate(context) {
  /**
   * @command extension.convertCase
   * @description Alterna entre maiúsculas e minúsculas no texto selecionado.
   */
  const comandoAlternarMaiusculas = vscode.commands.registerCommand(
    "extension.convertCase",
    () => {
      const editor = vscode.window.activeTextEditor;
      if (editor) {
        alterarTextoSelecionado(editor, (texto) =>
          texto === texto.toUpperCase()
            ? texto.toLowerCase()
            : texto.toUpperCase()
        );
      }
    }
  );

  /**
   * @command extension.convertTitleCase
   * @description Converte o texto para formato de título ou minúsculas.
   */
  const comandoTextoTitulo = vscode.commands.registerCommand(
    "extension.convertTitleCase",
    () => {
      const editor = vscode.window.activeTextEditor;
      if (editor) {
        alterarTextoSelecionado(editor, (texto) => {
          // Verifica se o texto está em formato de título
          const ehTitulo = texto
            .split(/\s+/)
            .every(
              (palavra) =>
                palavra.charAt(0).toLocaleUpperCase("pt-BR") +
                  palavra.slice(1).toLocaleLowerCase("pt-BR") ===
                palavra
            );

          if (ehTitulo) {
            // Se estiver em formato de título, converte para minúsculas
            return texto.toLocaleLowerCase("pt-BR");
          } else {
            // Caso contrário, converte para formato de título
            return texto
              .toLocaleLowerCase("pt-BR")
              .split(/\s+/)
              .map(capitalize)
              .join(" ");
          }
        });
      }
    }
  );

  /**
   * @command extension.convertUnderscoreCamel
   * @description Alterna entre formato camel case e underscores no texto selecionado.
   */
  const comandoUnderscoreParaCamelCase = vscode.commands.registerCommand(
    "extension.convertUnderscoreCamel",
    () => {
      const editor = vscode.window.activeTextEditor;
      if (editor) {
        alterarTextoSelecionado(editor, (texto) => {
          const ehCamelCase = /[a-zà-ÿ][A-Z]/.test(texto);
          return ehCamelCase
            ? convertToUnderscore(texto)
            : convertToCamelCase(texto);
        });
      }
    }
  );

  /**
   * @command extension.convertHyphenSpace
   * @description Alterna entre hífen e espaço no texto selecionado.
   */
  const comandoHyphenParaEspaco = vscode.commands.registerCommand(
    "extension.convertHyphenSpace",
    () => {
      const editor = vscode.window.activeTextEditor;
      if (editor) {
        alterarTextoSelecionado(editor, (texto) => {
          const contemHifen = /-/.test(texto);
          return contemHifen
            ? texto.replace(/-/g, " ") // Hífen para Espaço
            : texto.replace(/ /g, "-"); // Espaço para Hífen
        });
      }
    }
  );

  /**
   * @command extension.convertUnderscoreToSpace
   * @description Alterna entre underscore e espaço no texto selecionado.
   */
  const comandoUnderscoreParaEspaco = vscode.commands.registerCommand(
    "extension.convertUnderscoreToSpace",
    () => {
      const editor = vscode.window.activeTextEditor;
      if (editor) {
        alterarTextoSelecionado(editor, (texto) => {
          return texto.includes("_")
            ? texto.replace(/_/g, " ") // Underscore para Espaço
            : texto.replace(/\s+/g, "_"); // Espaço para Underscore
        });
      }
    }
  );

/**
 * @command extension.convertUnderscoreToHyphen
 * @description Alterna entre underscore e hífen no texto selecionado.
 */
const comandoUnderscoreParaHifen = vscode.commands.registerCommand(
  "extension.convertUnderscoreToHyphen",
  () => {
    const editor = vscode.window.activeTextEditor;
    if (editor) {
      alterarTextoSelecionado(editor, (texto) => {
        // Verifica se o texto contém underscore ou hífen e faz a conversão apropriada
        if (texto.includes("_")) {
          return texto.replace(/_/g, "-"); // Underscore para Hífen
        } else if (texto.includes("-")) {
          return texto.replace(/-/g, "_"); // Hífen para Underscore
        }
        return texto; // Retorna o texto original se nenhum dos caracteres estiver presente
      });
    }
  }
);


  // Registrando todos os comandos na extensão
  context.subscriptions.push(
    comandoAlternarMaiusculas,
    comandoTextoTitulo,
    comandoUnderscoreParaCamelCase,
    comandoHyphenParaEspaco,
    comandoUnderscoreParaEspaco,
    comandoUnderscoreParaHifen
  );

  // Exibe uma mensagem de boas-vindas na barra de status ao ativar a extensão
  mostrarStatusBarMensagem(l10n.t("welcomeMessage"));
}

/**
 * @function deactivate
 * @description Função chamada quando a extensão é desativada.
 */
function deactivate() {}

module.exports = {
  activate,
  deactivate,
};
