
const alimentosIniciais = [
    { id: 1, nome: "Maçã", emoji: "🍎", tipo: "healthy" },
    { id: 2, nome: "Banana", emoji: "🍌", tipo: "healthy" },
    { id: 3, nome: "Cenoura", emoji: "🥕", tipo: "healthy" },
    { id: 4, nome: "Brócolis", emoji: "🥦", tipo: "healthy" },
    { id: 5, nome: "Morango", emoji: "🍓", tipo: "healthy" },
    { id: 6, nome: "Hambúrguer", emoji: "🍔", tipo: "junk" },
    { id: 7, nome: "Batata frita", emoji: "🍟", tipo: "junk" },
    { id: 8, nome: "Refrigerante", emoji: "🥤", tipo: "junk" },
    { id: 9, nome: "Donut", emoji: "🍩", tipo: "junk" },
    { id: 10, nome: "Bala", emoji: "🍬", tipo: "junk" }
];

const foodList = document.getElementById("foodList");
const basket = document.getElementById("basket");
const junkBasket = document.getElementById("junkBasket");

const scoreElement = document.getElementById("score");
const progressElement = document.getElementById("progress");
const message = document.getElementById("message");
const result = document.getElementById("result");
const finalScore = document.getElementById("finalScore");

const dropZones = document.querySelectorAll(".drop-zone");

let alimentos = [];
let pontuacao = 0;
let separados = 0;
let alimentoArrastado = null;

function embaralhar(lista) {
    const copia = [...lista];

    for (let i = copia.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));

        [copia[i], copia[j]] = [copia[j], copia[i]];
    }

    return copia;
}

function criarCartao(alimento) {
    const cartao = document.createElement("div");

    cartao.className = "alimento";
    cartao.draggable = true;
    cartao.dataset.id = alimento.id;

    const emoji = document.createElement("span");
    emoji.className = "emoji";
    emoji.textContent = alimento.emoji;

    const nome = document.createElement("span");
    nome.textContent = alimento.nome;

    cartao.append(emoji, nome);

    cartao.addEventListener("dragstart", evento => {
        if (alimento.separado) {
            evento.preventDefault();
            return;
        }

        alimentoArrastado = alimento.id;

        cartao.classList.add("arrastando");

        evento.dataTransfer.setData(
            "text/plain",
            String(alimento.id)
        );

        evento.dataTransfer.effectAllowed = "move";
    });

    cartao.addEventListener("dragend", () => {
        cartao.classList.remove("arrastando");
        alimentoArrastado = null;

        dropZones.forEach(zona => {
            zona.classList.remove("destino");
        });
    });

    return cartao;
}

function iniciarJogo() {
    alimentos = embaralhar(alimentosIniciais).map(alimento => ({
        ...alimento,
        separado: false
    }));

    pontuacao = 0;
    separados = 0;
    alimentoArrastado = null;

    foodList.replaceChildren();
    basket.replaceChildren();
    junkBasket.replaceChildren();

    dropZones.forEach(zona => {
        zona.classList.remove("destino");
    });

    result.hidden = true;

    mostrarMensagem(
        "💡 Arraste cada alimento para a área correspondente!",
        ""
    );

    atualizarPlacar();

    alimentos.forEach(alimento => {
        foodList.appendChild(criarCartao(alimento));
    });
}

function atualizarPlacar() {
    scoreElement.textContent = pontuacao;
    progressElement.textContent =
        separados + "/" + alimentos.length;
}

function mostrarMensagem(texto, tipo) {
    message.textContent = texto;
    message.className = "mensagem";

    if (tipo) {
        message.classList.add(tipo);
    }
}

function verificarResposta(zona) {
    if (alimentoArrastado === null) {
        return;
    }

    const alimento = alimentos.find(item =>
        item.id === Number(alimentoArrastado)
    );

    if (!alimento || alimento.separado) {
        return;
    }

    const categoriaEscolhida = zona.dataset.type;

    if (alimento.tipo === categoriaEscolhida) {
        alimento.separado = true;
        separados++;

        const cartao = document.querySelector(
            '.alimento[data-id="' + alimento.id + '"]'
        );

        cartao.classList.remove("arrastando");
        cartao.classList.add("correto");
        cartao.draggable = false;

        if (alimento.tipo === "healthy") {
            pontuacao += 10;
            basket.appendChild(cartao);

            mostrarMensagem(
                "✅ Muito bem! " + alimento.nome +
                " foi para a cesta. +10 pontos!",
                "sucesso"
            );
        } else {
            pontuacao += 5;
            junkBasket.appendChild(cartao);

            mostrarMensagem(
                "👍 Classificação correta! " +
                alimento.nome + " foi separado. +5 pontos!",
                "sucesso"
            );
        }

        alimentoArrastado = null;
        atualizarPlacar();

        if (separados === alimentos.length) {
            result.hidden = false;

            finalScore.textContent =
                "Sua pontuação final foi de " +
                pontuacao + " pontos!";

            mostrarMensagem(
                "🎉 Você classificou todos os alimentos!",
                "sucesso"
            );
        }
    } else {
        pontuacao = Math.max(0, pontuacao - 5);

        mostrarMensagem(
            "❌ Essa não é a categoria correta! " +
            "Você perdeu 5 pontos. Tente novamente.",
            "erro"
        );

        atualizarPlacar();
    }
}

dropZones.forEach(zona => {

    zona.addEventListener("dragover", evento => {
        evento.preventDefault();

        evento.dataTransfer.dropEffect = "move";
        zona.classList.add("destino");
    });

    zona.addEventListener("dragleave", evento => {
        if (!zona.contains(evento.relatedTarget)) {
            zona.classList.remove("destino");
        }
    });

    zona.addEventListener("drop", evento => {
        evento.preventDefault();

        zona.classList.remove("destino");

        const id = evento.dataTransfer.getData("text/plain");

        if (id) {
            alimentoArrastado = Number(id);
        }

        verificarResposta(zona);
    });
});

document.getElementById("restart")
    .addEventListener("click", iniciarJogo);

document.getElementById("playAgain")
    .addEventListener("click", iniciarJogo);

iniciarJogo();