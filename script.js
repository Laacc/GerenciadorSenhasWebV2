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
const formNovaSenha = document.getElementById("formNovaSenha");
const plataforma = document.getElementById("inputPlataforma");
const loginSite = document.getElementById("inputLoginSite");
const listaSenhas = document.getElementById("listaSenhas");
const msgVazio = document.getElementById("msgVazio");
const dlg = document.getElementById("dlgConfirmar");
const dlgTexto = document.getElementById("dlgTexto");

async function iniciar(){

const {data} = await db.auth.getSession();

if(data.session){
    telaLogin.hidden = true;
    telaCofre.hidden = false;
    carregarSenhas();
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

async function carregarSenhas(){
    const {data, error} = await db.from("senhas").select("*").order("created_at", {ascending: false});

    if(error){
        mostrarMsg(`${error.message}`, true);
        return
    }

    listaSenhas.replaceChildren();

    if(data.length === 0){
        msgVazio.hidden = false;
        return;
    }
    msgVazio.hidden = true;

    for(const item of data){

        const lista = document.createElement("li");
        lista.className = "list-group-item d-flex justify-content-between align-items-start gap-2";
        
        const texto = document.createElement("div");
        texto.className = "text-break";

        const nome = document.createElement("strong");
        nome.textContent = item.plataforma;

        const login = document.createElement("small");
        login.className = "d-block", login.textContent = item.login_site;

        const btnApagar = document.createElement("button");
        btnApagar.type = "button", btnApagar.className = "btn btn-outline-danger btn-sm", btnApagar.textContent = "Apagar";

        btnApagar.addEventListener("click", async () => {
            if(!(await confirmar(`Apagar a senha de ${item.plataforma}?`))){
                return;
            };

            const {error} = await db.from("senhas").delete().eq("id", item.id);

            if(error){
                mostrarMsg(`${error.message}`, true);
                return;
            } else {
                mostrarMsg("Senha apagada.", false);
                carregarSenhas();
            }
        });

        const acoes = document.createElement("div");
        acoes.className = "d-flex gap-2 flex-shrink-0";

        const btnCopiar = document.createElement("button");
        btnCopiar.type = "button", btnCopiar.className = "btn btn-outline-primary btn-sm", btnCopiar.textContent = "Copiar";

        btnCopiar.addEventListener("click", async () => {
            try { 
                await navigator.clipboard.writeText(item.senha_cifrada);
                mostrarMsg("Senha copiada!", false);
            } catch { 
                mostrarMsg("Não foi possível copiar.", true)
            };
            
        });

        texto.append(nome, login);
        acoes.append(btnCopiar, btnApagar);
        lista.append(texto, acoes);
        listaSenhas.append(lista);
    }

};

function confirmar(texto){
    dlgTexto.textContent = texto;
    dlg.returnValue = "";

    return new Promise((resolve) => {
        dlg.addEventListener("close", () => {
            if(dlg.returnValue == "sim"){
                resolve(true);
            } else {
                resolve(false);
            }
        }, {once: true});

        dlg.showModal();
    });
};

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
        carregarSenhas();

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
        listaSenhas.replaceChildren();
    }
});

btnGerar.addEventListener("click", function(){
    senhaSite.value = gerarSenha();
});

formNovaSenha.addEventListener("submit", async (evento) => {
    evento.preventDefault();

    const userSenha = senhaSite.value;
    const userPlataforma = plataforma.value.trim();
    const userLoginSite = loginSite.value.trim();

    if(userSenha === ""){
        mostrarMsg("Gere uma senha primeiro.", true);
        return;
    }

    const {data, error} = await db.from("senhas").insert({plataforma: userPlataforma, login_site: userLoginSite, senha_cifrada: userSenha});

    if(error){
        mostrarMsg(`${error.message}`, true);
        return;
    } else {
        mostrarMsg("Senha salva!", false);
        formNovaSenha.reset();
        carregarSenhas();
    }
});

iniciar();