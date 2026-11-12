const db = supabase.createClient("https://xxglsloabtfwegjwtfvd.supabase.co", "sb_publishable_gBXO4FEkiKdrnIl7CMFezQ_64_tPboH");
const email = document.getElementById("inputEmail");
const senha = document.getElementById("inputSenha");
const btnCriarConta = document.getElementById("btnCriarConta");
const telaLogin = document.getElementById("telaLogin");
const telaCofre = document.getElementById("telaCofre");
const formLogin = document.getElementById("formLogin");
const btnSair = document.getElementById("btnSair");
const msg = document.getElementById("msg");
const btnGerar = document.getElementById("btnGerar");
const senhaSite = document.getElementById("inputSenhaSite");

async function iniciar(){

const {data} = await db.auth.getSession();

if(data.session){
    telaLogin.hidden = true;
    telaCofre.hidden = false;
}
};

function mostrarMsg(texto, erro){

    msg.textContent = texto;
    msg.classList.remove("text-success", "text-danger");

    if(erro == true){
        msg.classList.add("text-danger");
    } else {
        msg.classList.add("text-success");
    }
};

function gerarSenha(){
    const caracteres = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%&*?";
    const tamanho = 16;
    const sorteios = new Uint32Array(tamanho);
    crypto.getRandomValues(sorteios);

    let senhaGerada = "";

    for(let i = 0; i < tamanho; i++){
        const indice = sorteios[i] % caracteres.length;
        senhaGerada += caracteres[indice];
    }

    return senhaGerada;
}

btnCriarConta.addEventListener("click", async () => {

    const userEmail = email.value.trim();
    const userSenha = senha.value;

    if(userEmail === ""){
        mostrarMsg("Email inválido", true);
        return;
    }

    if(userSenha.length < 6){
        mostrarMsg("Senha inválida", true);
        return;
    }

    const {data, error} = await db.auth.signUp({email: userEmail, password: userSenha});

    if(error){
        mostrarMsg(`${error.message}`, true);
        return;
    } else {
        mostrarMsg("Conta criada com sucesso!", false);
    }
});

formLogin.addEventListener("submit", async (evento) => {
    evento.preventDefault();

    const userEmail = email.value.trim();
    const userSenha = senha.value;

    const {data, error} = await db.auth.signInWithPassword({email: userEmail, password: userSenha})

    if(error){
        mostrarMsg(`${error.message}`, true);
        return;
    } else {
        telaLogin.hidden = true;
        telaCofre.hidden = false;

        email.value = "";
        senha.value = "";
        msg.textContent = "";
    }
});

btnSair.addEventListener("click", async () => {

    const {data, error} = await db.auth.signOut();

    if(error){
        mostrarMsg(`${error.message}`, true);
        return;
    } else {
        telaCofre.hidden = true;
        telaLogin.hidden = false;

        email.value = "";
        senha.value = "";
        msg.textContent = "";
        senhaSite.value = "";
    }
});

btnGerar.addEventListener("click", function(){
    senhaSite.value = gerarSenha();
});

iniciar();