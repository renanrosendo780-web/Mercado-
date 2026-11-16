
// =========================================
// MERCADO CONFIANÇA
// SISTEMA DE CADASTRO
// =========================================


// 1. SELECIONAR ELEMENTOS DO HTML

const formulario = document.getElementById("formCadastro");

const nome = document.getElementById("nome");
const email = document.getElementById("email");
const telefone = document.getElementById("telefone");

const senha = document.getElementById("senha");
const confirmarSenha = document.getElementById("confirmarSenha");


// 2. MÁSCARA DO TELEFONE

telefone.addEventListener("input", function () {

    // Remove tudo que não for número
    let numero = telefone.value.replace(/\D/g, "");

    // Limita a quantidade de números
    numero = numero.substring(0, 11);

    // Aplica a formatação
    if (numero.length > 7) {

        numero = numero.replace(
            /^(\d{2})(\d{5})(\d{0,4})$/,
            "($1) $2-$3"
        );

    } else if (numero.length > 2) {

        numero = numero.replace(
            /^(\d{2})(\d{0,5})$/,
            "($1) $2"
        );

    } else if (numero.length > 0) {

        numero = numero.replace(
            /^(\d*)$/,
            "($1"
        );

    }

    telefone.value = numero;

});


// 3. VALIDAR SE AS SENHAS SÃO IGUAIS

function verificarSenhas() {

    if (senha.value !== confirmarSenha.value) {

        confirmarSenha.setCustomValidity(
            "As senhas não são iguais."
        );

    } else {

        confirmarSenha.setCustomValidity("");

    }

}


// Verifica quando o usuário digita
senha.addEventListener("input", verificarSenhas);

confirmarSenha.addEventListener("input", verificarSenhas);


// 4. ENVIAR FORMULÁRIO

formulario.addEventListener("submit", function (evento) {

    // Impede o envio tradicional da página
    evento.preventDefault();

    // Verifica novamente as senhas
    verificarSenhas();

    // Verifica se os campos estão válidos
    if (!formulario.checkValidity()) {

        formulario.reportValidity();

        return;

    }

    // Exibe uma mensagem de demonstração
    alert(
        "Cadastro validado com sucesso!\n\n" +
        "A próxima etapa será conectar o formulário " +
        "ao banco de dados."
    );

    // Limpa os campos
    formulario.reset();

});

