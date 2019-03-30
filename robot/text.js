const algorithmia = require('algorithmia');
const algorithmiaApiKey = require('../credentials/algorithmia.json').apiKey;
const sbd = require('sbd');//sentence boundary detection

const watsonApiKey = require('../credentials/watson.json').apiKey;
 
const NaturalLanguageUnderstandingV1 = require('watson-developer-cloud/natural-language-understanding/v1.js')
 
const nlu = new NaturalLanguageUnderstandingV1({
	iam_apikey: "y6i6wbnMJwBovDtYa2GrwTiQXwGJBwE-IgJLAlm_VefZ",
  	version: '2018-04-05',
  	url: 'https://gateway.watsonplatform.net/natural-language-understanding/api/'
});

const state = require('./state.js');

async function robot(){
	const content = state.load();
	await fetchContentFromWikipedia(content);
	sanitizeContent(content);
	breakContentIntoSentences(content);
	limitMaximumSentences(content);
	await fetchKeywordsOfAllSentences(content);
	state.save(content);
 
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

function limitMaximumSentences(content){
	content.sentences = content.sentences.slice(0, content.maximumSentences);
}

async function fetchKeywordsOfAllSentences(content){
	for(const sentence of content.sentences){
		sentence.keywords = await fetchWatsonAndReturnKeywords(sentence.text);
	}
}

async function fetchWatsonAndReturnKeywords(sentence){
	return new Promise((resolve, reject) => {
		nlu.analyze({
			text: sentence,
			features:{
				keywords: {}
			}
		}, (error, response) => {
			if(error){
				throw error;
			}
			const keywords = response.keywords.map((keyword) => {
          		return keyword.text
        	})
        	resolve (keywords);
		});
	})
}

module.exports = robot;