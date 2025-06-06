import {unified} from 'unified';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import rehypeStringify from 'rehype-stringify';
import rehypePrism from '@mapbox/rehype-prism';
// @ts-ignore
import html2pdf from 'html2pdf.js';

import data from './cards.json';

// @ts-ignore
const markdownParser = unified().use(remarkParse).use(remarkRehype).use(rehypePrism).use(rehypeStringify);

const appEl = document.querySelector<HTMLDivElement>('#app')!;

(async () => {
    const cardsPerPage = 8;
    const allPages = []; // store references to each .page div

for (let i = 0; i < data.cards.length; i += cardsPerPage) {
    // Extraire un paquet de 8 cartes max
    const cardsBatch = data.cards.slice(i, i + cardsPerPage);
    
    // Création page recto (questions)
    const rectoPage = document.createElement('div');
    rectoPage.className = 'page recto';
    rectoPage.id = `page${i}`
    for (const card of cardsBatch) {
        const questions: string[] = [];
        if (card.questions) {
            for (const question of card.questions) {
            questions.push((await markdownParser.process(question)).toString());
            } 
        }
        rectoPage.innerHTML += `
        <div class="card" style="--color: var(--color-${card.category})">
            <div class="header">
                <div class="ttmc" >Tu te mets combien en…</div>
                <div class="theme" >${card.theme}</div>
                <img class="icon" src="/${card.category}.svg" alt="${card.category}-logo" />
            </div>
            ${card.instructions ? `<div class="instructions">${card.instructions}</div>` : ''}
            ${card.questions ? `
            <div class="questions">${questions
                .map(
                    (question, i) => `
                        <div class="question"><div class="num">${i + 1}</div>${question}</div>
                    `,
                )
                .join('')}</div>` : ''}
        </div>`;
    }
    appEl.appendChild(rectoPage);
    allPages.push(rectoPage);

    // Création page verso (réponses)
    const versoPage = document.createElement('div');
    versoPage.className = 'page verso';
    versoPage.id = `page${i}`
    for (const card of cardsBatch) {
        const answers: string[] = [];
        if (card.answers) {
            for (const answer of card.answers) {
            answers.push((await markdownParser.process(answer)).toString());
            }
        }
        versoPage.innerHTML += `
        <div class="card back" style="--color: var(--color-${card.category})">
            <div class="header">
                <div class="theme">RÉPONSES</div>
                <img class="icon" src="/ttmcj-logo.svg" alt="ttmcj-logo" />
            </div>
            ${card.answers ? `
            <div class="answers">${answers
                .map(
                    (answer, i) => `
                <div class="answer"><div class="num">${i + 1}</div>${answer}</div>
            `,
                )
                .join('')}</div>` : ''}
        </div>
        `;
    }
    appEl.appendChild(versoPage);
    allPages.push(versoPage);
}

// Now export allPages to a PDF using html2pdf.js
const opt = {
margin: 0,
filename: 'ttmcj-cards.pdf',
image: { type: 'jpeg', quality: 0.98 },
html2canvas: { scale: 2, useCORS: true },
jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
};


for (let i = 1; i < allPages.length; i++) {
html2pdf().set(opt).from(allPages[i]);
}

})();

