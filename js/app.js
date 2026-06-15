function showScreen(id){

    document
    .querySelectorAll(".screen")
    .forEach(screen=>{

        screen.classList.remove(
            "active"
        );
    });

    document
    .getElementById(
        "screen" + id
    )
    .classList.add(
        "active"
    );
}

function registerUser(){

    const user={

        name:
        document.getElementById(
            "registerName"
        ).value,

        email:
        document.getElementById(
            "registerEmail"
        ).value,

        password:
        document.getElementById(
            "registerPassword"
        ).value
    };

    localStorage.setItem(
        "citaciudadanaUser",
        JSON.stringify(user)
    );

    showScreen(7);
}

function loginUser(){

    const email=
    document.getElementById(
        "loginEmail"
    ).value;

    const password=
    document.getElementById(
        "loginPassword"
    ).value;

    const user=
    JSON.parse(
        localStorage.getItem(
            "citaciudadanaUser"
        )
    );

    if(
        user &&
        user.email===email &&
        user.password===password
    ){

        goToMenu();
    }
    else{

        showToast(
            "Credenciales incorrectas"
        );
    }
}

function goToMenu(){

    const user=
    JSON.parse(
        localStorage.getItem(
            "citaciudadanaUser"
        )
    );

    if(user){

        document
        .getElementById(
            "userGreeting"
        )
        .innerText=
        "Hola " +
        user.name;
    }

    updateAppointmentCards();

    showScreen(8);
}

function saveAppointment(){

    const appointment={

        speciality:
        document.getElementById(
            "speciality"
        ).value,

        date:
        document.getElementById(
            "appointmentDate"
        ).value,

        time:
        document.getElementById(
            "appointmentTime"
        ).value
    };

    const appointments=
    JSON.parse(
        localStorage.getItem(
            "appointments"
        )
    ) || [];

    appointments.push(
        appointment
    );

    localStorage.setItem(
        "appointments",
        JSON.stringify(
            appointments
        )
    );

    showToast(
        "Cita guardada"
    );

    updateAppointmentCards();

    showScreen(8);
}

function updateAppointmentCards(){

    const appointments=
    JSON.parse(
        localStorage.getItem(
            "appointments"
        )
    ) || [];

    const next=
    document.getElementById(
        "nextAppointment"
    );

    const history=
    document.getElementById(
        "historyList"
    );

    history.innerHTML="";

    if(
        appointments.length===0
    ){

        next.innerText=
        "Sin citas";

        return;
    }

    next.innerHTML=
        appointments[0].date+
        "<br>"+
        appointments[0].time+
        "<br>"+
        appointments[0].speciality;

    appointments.forEach(item=>{

        const li=
        document.createElement(
            "li"
        );

        li.innerText=
        item.date+
        " - "+
        item.speciality;

        history.appendChild(li);
    });
}

function loadProfile(){

    const user=
    JSON.parse(
        localStorage.getItem(
            "citaciudadanaUser"
        )
    );

    if(!user) return;

    document
    .getElementById(
        "profileName"
    )
    .innerText=
    user.name;

    document
    .getElementById(
        "profileEmail"
    )
    .innerText=
    user.email;

    showScreen(9);
}

function loadProfileEditor(){

    const user=
    JSON.parse(
        localStorage.getItem(
            "citaciudadanaUser"
        )
    );

    document
    .getElementById(
        "editName"
    )
    .value=
    user.name || "";

    document
    .getElementById(
        "editEmail"
    )
    .value=
    user.email || "";

    showScreen(10);
}

function saveProfile(){

    const user=
    JSON.parse(
        localStorage.getItem(
            "citaciudadanaUser"
        )
    );

    user.name=
    document.getElementById(
        "editName"
    ).value;

    user.email=
    document.getElementById(
        "editEmail"
    ).value;

    localStorage.setItem(
        "citaciudadanaUser",
        JSON.stringify(user)
    );

    showToast(
        "Perfil actualizado"
    );

    loadProfile();
}

function analyzeSymptoms(){

    const input=
    document.getElementById(
        "symptomInput"
    );

    const text=
    input.value.trim();

    if(text==="") return;

    addUserMessage(text);

    input.value="";

    setTimeout(()=>{

        let response=
        "Te recomiendo Medicina General";

        if(
            text.toLowerCase()
            .includes("pecho")
        ){

            response=
            "Posible consulta con Cardiología";
        }

        if(
            text.toLowerCase()
            .includes("piel")
        ){

            response=
            "Posible consulta con Dermatología";
        }

        addBotMessage(
            response
        );

    },1000);
}

function addUserMessage(msg){

    const div=
    document.createElement(
        "div"
    );

    div.className=
    "user-message";

    div.innerText=msg;

    document
    .getElementById(
        "chatContainer"
    )
    .appendChild(div);
}

function addBotMessage(msg){

    const div=
    document.createElement(
        "div"
    );

    div.className=
    "bot-message";

    div.innerText=msg;

    document
    .getElementById(
        "chatContainer"
    )
    .appendChild(div);
}

function toggleMenu(){

    document
    .getElementById(
        "sideMenu"
    )
    .classList.toggle(
        "active"
    );
}

function toggleTheme(){

    document.body
    .classList.toggle(
        "dark-theme"
    );
}

function showToast(message){

    const toast=
    document.getElementById(
        "toast"
    );

    toast.innerText=
    message;

    toast.classList.add(
        "show-toast"
    );

    setTimeout(()=>{

        toast.classList.remove(
            "show-toast"
        );

    },2500);
}

function changePhoto(event){

    const file=
    event.target.files[0];

    if(!file) return;

    const reader=
    new FileReader();

    reader.onload=function(e){

        document
        .getElementById(
            "profileImage"
        )
        .src=
        e.target.result;

        localStorage.setItem(
            "profileImage",
            e.target.result
        );
    }

    reader.readAsDataURL(
        file
    );
}

window.onload=()=>{

    setTimeout(()=>{

        document
        .getElementById(
            "splashScreen"
        )
        .classList.add(
            "hideSplash"
        );

    },2000);
}