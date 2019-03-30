const readline = require('readline-sync');//biblioteca para receber o input do usuario
const state = require('./state');

function robot(){
    const content = {
        maximumSentences: 7
    }
    //-----executando as funções----
    content.searchTerm = askAndReturnSearchTerm();
    content.prefixe = askAndReturnPrefix();
    state.save(content);

    function askAndReturnSearchTerm(){//função para definir o tema do video
        return readline.question("Type a Wikipedia search term: ");
    }

    function askAndReturnPrefix(){//função para definir o prefixo
        const prefixes = ['Who is', 'What is', 'The history of'];//prefixos para seleçâo
        const selectedPrefixIndex = readline.keyInSelect(prefixes, 'Choose one option');//função da biblioteca que gera as opções a serem selecionadas
        const selectedPrefixText = prefixes[selectedPrefixIndex];//selectedPrefixIndex retorna 1 numero correspondente ao texto do array prefixes
        
        return selectedPrefixText;
    }
}

module.exports = robot;