const algorithmia = require('algorithmia');
const algorithmiaApiKey = require('../credentials/algorithmia.json').apiKey;
const sbd = require('sbd');//sentence boundary detection

async function robot(content){
	await fetchContentFromWikipedia(content);
	sanitizeContent(content);
	breakContentIntoSentences(content);
 
	async function fetchContentFromWikipedia(content) {
	    	const algorithmiaAuthenticated = algorithmia('simNamEs9PVGryBRDxPCrDZzlM/1');//autentica o usuario
	    	const wikipediaAlgorithm = algorithmiaAuthenticated.algo('web/WikipediaParser/0.1.2');//acessa a api
	    	const wikipediaResponds = await wikipediaAlgorithm.pipe(content.searchTerm);//pipe seria o input do termo de busca
	    	const wikipediaContent = wikipediaResponds.get();//o resultado retornado	
	    	
	    	content.sourceContentOriginal = wikipediaContent.content;
	    	//console.log(wikipediaContent);
	}

	function sanitizeContent(content) {
		const withoutBlankLinesAndMarks= removeBlankLinesAndMarks(content.sourceContentOriginal);
		const withoutDatesInParentheses = removeDatesInParentheses(withoutBlankLinesAndMarks);

		content.sourceContentSanitize = withoutDatesInParentheses;

	    function removeBlankLinesAndMarks(text){
	    	const allLines = text.split('\n');
	    	
	    	//-----------O codigo abaixo cria 1 filtro em todas as linhas para remover linhas em branco e marcações
	    	const withoutBlankLinesAndMarks = allLines.filter((line)=>{
	    		if((line.trim().length === 0)||(line.trim().startsWith('='))){
	    			return false;
	    		}
	    		return true;
	    	})
	    	//--------------------------------------

	    	//console.log(withoutBlankLinesAndMarks);
	    	return withoutBlankLinesAndMarks.join(' ');
  		}

  		function removeDatesInParentheses(text){
  			return text.replace(/\((?:\([^()]*\)|[^()])*\)/gm, '').replace(/  /g,' ');
  		}
	}

	function breakContentIntoSentences(content){
		content.sentences = [];

		const sentences = sbd.sentences(content.sourceContentSanitize);
		sentences.forEach((sentence) => {
			content.sentences.push({
				text: sentence,
				keywords: [],
				imagens: []
			})
		})
	}
}
module.exports = robot;