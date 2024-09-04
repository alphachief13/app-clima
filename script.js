const inputPesquisa = document.querySelector("#input-pesquisa");
const $local = document.querySelector("#local");
const $tempAtual = document.querySelector("#temp-atual");
const $minTemp = document.querySelector("#min-temp");
const $maxTemp = document.querySelector("#max-temp");
const $cidadePais = document.querySelector("#cidade-pais");
const $sensacao = document.querySelector("#sensacao");
const $descricao = document.querySelector("#descricao");
const $umidade = document.querySelector("#umidade");
const $veloVento = document.querySelector("#velo-vento");
const $nebulosidade = document.querySelector("#nebulosidade");
const $nascerSol = document.querySelector("#nascer-sol");
const $porSol = document.querySelector("#por-sol");
const $direcaoVento = document.querySelector("#direcao-vento");
const $extraInfosBox = document.querySelector(".extra-infos")
const $barraPesquisa = document.querySelector(".barra-pesquisa")
const $info = document.querySelectorAll(".info")
const $minMax = document.querySelector(".min-max")
const $imgClima = document.querySelector("#img-clima")

const key = "99eeb5d39cc8dee5882237c43f1ccf71";

function kelvinToCelsius(temp){
    return (temp-273.15).toFixed(0);
}

function estiloDia(){
    document.body.style.background = 'url("media/fundo-dia.png")';
    document.body.style.backgroundRepeat = "no-repeat";
    document.body.style.backgroundSize = "cover";
    document.body.style.backgroundAttachment = "fixed";

    $extraInfosBox.style.background = 'url("media/ret-dia.png")'
    $barraPesquisa.style.backgroundColor = '#707ddd';
    inputPesquisa.style.backgroundColor = '#707ddd';
    $info.forEach(info => info.style.color = "white");
    $minMax.style.color = "white";
}

function estiloNoite(){
    document.body.style.background = 'url("media/fundo-noite.png")'
    $extraInfosBox.style.background = 'url("media/ret-noite.png")'
    $barraPesquisa.style.backgroundColor = '#040a32';
    inputPesquisa.style.backgroundColor = '#040a32';
    $info.forEach(info => info.style.color = "rgb(202, 202, 202)");
    $minMax.style.color = "rgb(202, 202, 202)";                
    document.body.style.backgroundRepeat = "no-repeat";
    document.body.style.backgroundSize = "cover";
    document.body.style.backgroundAttachment = "fixed";
}

async function getLatAndLon(city){
    try{
        const response = await fetch(`https://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=5&appid=${key}`);
        
        if(!response.ok){
            throw new Error("Erro na req: ", response.status);
        }

        const data = await response.json();
        lat = data[0].lat;
        lon = data[0].lon;
        
        return {lat, lon};

    } catch(error){
        console.log(error);
    }

}

function setNewLoc(data){
    const timezoneOffset = data.timezone;

    function formatTime(unixTime) {
        const date = new Date(unixTime * 1000);
        const localTime = new Date(date.getTime() + timezoneOffset * 1000);
        let horaAtual = localTime.getUTCHours();
        let minutoAtual = localTime.getUTCMinutes();
        if(minutoAtual < 10){
            minutoAtual = `0${minutoAtual}`;
        } 
        if(horaAtual < 10){
            horaAtual = `0${horaAtual}`;
        }

        return `${horaAtual}h${minutoAtual}`;
    }
    
    const nascerSol = formatTime(data.sys.sunrise);
    const porSol = formatTime(data.sys.sunset);

    const timezone = data.timezone; 
    const dataAtual = new Date();
    const dataNoTimezone = new Date(dataAtual.getTime() + (timezone + dataAtual.getTimezoneOffset() * 60) * 1000);

    let horaAtual = dataNoTimezone.getHours();
    let minutoAtual = dataNoTimezone.getMinutes(); 

    if(minutoAtual < 10){
        minutoAtual = `0${minutoAtual}`;
    } 
    if(horaAtual < 10){
        horaAtual = `0${horaAtual}`;
    }

    $local.textContent = `${data.name}, ${horaAtual}h${minutoAtual}`;
    $tempAtual.textContent = `${kelvinToCelsius(data.main.temp)}°`;
    $minTemp.textContent = `Mín: ${kelvinToCelsius(data.main.temp_min)}°`;
    $maxTemp.textContent = `Máx: ${kelvinToCelsius(data.main.temp_max)}°`;
    $sensacao.textContent = `Sensação Térmica: ${kelvinToCelsius(data.main.feels_like)}°`;
    $descricao.textContent = `Descrição: ${data.weather[0].description}`;
    $umidade.textContent = `Umidade: ${data.main.humidity}%`;
    $veloVento.textContent = `Velocidade do vento: ${data.wind.speed} m/s`;
    $nebulosidade.textContent = `Nebulosidade: ${data.clouds.all}%`;
    $cidadePais.textContent = `Local: ${data.name}, ${data.sys.country}`;

    $nascerSol.textContent = `Nascer do Sol: ${nascerSol}`;
    $porSol.textContent = `Pôr do Sol: ${porSol}`;
    $direcaoVento.textContent = `Direção do Vento: ${data.wind.deg}°`;

    $imgClima.src = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
}

async function getWeather(city){
    const geo = await getLatAndLon(city);
    if(geo){
        const lat = geo.lat;
        const lon = geo.lon;
               
        try{
            const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${key}&lang=pt_br`);
            
            if(!response.ok){
                throw new Error("Erro na req: ", response.status);
            }
            
            const data = await response.json();
            setNewLoc(data);
            
            const timezone = data.timezone; 
            const dataAtual = new Date();
            const dataNoTimezone = new Date(dataAtual.getTime() + (timezone + dataAtual.getTimezoneOffset() * 60) * 1000);
            const horaAtual = dataNoTimezone.getHours();
            
            const timezoneOffset = data.timezone;

            function formatTime(unixTime) {
                const date = new Date(unixTime * 1000);
                const localTime = new Date(date.getTime() + timezoneOffset * 1000);
                return localTime.getUTCHours()
            }
    
            const porSol = formatTime(data.sys.sunset);

            if(horaAtual <= porSol && horaAtual >= 5){
                estiloDia();

            } else if(horaAtual <= porSol && horaAtual < 5){
                estiloNoite();

            } 
            else if(horaAtual > porSol) {
                estiloNoite();
            }

        } catch(error){
            console.log(error);
        }
    }
        
}

function pesquisar(){
    const input = inputPesquisa.value;
    if(input){
        getWeather(input);
    }
}


getWeather("Natal");
        
    
    
    
    