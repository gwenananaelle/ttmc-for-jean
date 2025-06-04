import {unified} from 'unified';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import rehypeStringify from 'rehype-stringify';
import rehypePrism from '@mapbox/rehype-prism';

import data from './cards.json';

// @ts-ignore
const markdownParser = unified().use(remarkParse).use(remarkRehype).use(rehypePrism).use(rehypeStringify);

const appEl = document.querySelector<HTMLDivElement>('#app')!;

(async () => {
    const cardsPerPage = 8;

for (let i = 0; i < data.cards.length; i += cardsPerPage) {
    // Extraire un paquet de 8 cartes max
    const cardsBatch = data.cards.slice(i, i + cardsPerPage);
    
    // Création page recto (questions)
    const rectoPage = document.createElement('div');
    rectoPage.className = 'page recto';
    for (const card of cardsBatch) {
        const questions: string[] = [];
        for (const question of card.questions) {
            questions.push((await markdownParser.process(question)).toString());
        }
        rectoPage.innerHTML += `
        <div class="card" style="--color: var(--color-${card.category})">
            <div class="header">
                <div class="ttmc" >Tu te mets combien en…</div>
                <div class="theme" >${card.theme}</div>
                <img class="icon" src="/${card.category}.svg" alt="${card.category}-logo" />
            </div>
            <div class="questions">${questions
                .map(
                    (question, i) => `
                        <div class="question"><div class="num">${i + 1}</div>${question}</div>
                    `,
                )
                .join('')}</div>
        </div>`;
    }
    appEl.appendChild(rectoPage);

    // Création page verso (réponses)
    const versoPage = document.createElement('div');
    versoPage.className = 'page verso';
    for (const card of cardsBatch) {
        const answers: string[] = [];
        for (const answer of card.answers) {
            answers.push((await markdownParser.process(answer)).toString());
        }
        versoPage.innerHTML += `
        <div class="card back" style="--color: var(--color-${card.category})">
            <div class="header">
                <div class="theme">RÉPONSES</div>
                <img class="icon" src="/ttmcj-logo.svg" alt="ttmcj-logo" />
            </div>
            <div class="answers">${answers
                .map(
                    (answer, i) => `
                <div class="answer"><div class="num">${i + 1}</div>${answer}</div>
            `,
                )
                .join('')}</div>
        </div>
        `;
    }
    appEl.appendChild(versoPage);
}   
})();

