const API = "";

function getToken(){
    return localStorage.getItem("token");
}



function setToken(token){
    localStorage.setItem("token",token);
}



function logout(){

    localStorage.removeItem("token");

    location.href="/public/login.html";

}



function checkLogin(){

    if(!getToken()){
        location.href="/public/login.html";
    }

}



async function login(){

    const username =
        document.getElementById("username").value;

    const password =
        document.getElementById("password").value;

    const res = await fetch("/login",{

        method:"POST",

        headers:{
            "Content-Type":"application/json"
        },

        body:JSON.stringify({
            username,
            password
        })

    });

    const data = await res.json();

    if(data.token){

        setToken(data.token);

        location.href="/public/index.html";

    }else{

        document.getElementById("error").innerText =
            "Login failed";

    }

}



async function api(path,data){

    const res = await fetch(path,{

        method:"POST",

        headers:{
            "Content-Type":"application/json",
            "token":getToken()
        },

        body:JSON.stringify(data)

    });

    if(res.status === 401){

        logout();

        return;

    }

    return res.json();

}



async function loadConfig(){

    const data = await api("/config",{

        action:"read",
        file:"webui.json"

    });

    document.getElementById("config").innerText =
        JSON.stringify(data,null,2);

}



async function setConfig(){

    const key =
        document.getElementById("key").value;

    const value =
        document.getElementById("value").value;

    const data = await api("/config",{

        action:"set",
        file:"webui.json",
        key,
        value

    });

    document.getElementById("config").innerText =
        JSON.stringify(data,null,2);

}