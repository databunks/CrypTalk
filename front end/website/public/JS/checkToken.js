function checkToken()
{
    var xhr = new XMLHttpRequest();
    xhr.open('GET', 'https://us-central1-cryptalk-72a10.cloudfunctions.net/checkToken');
    xhr.onreadystatechange = function ()
    {
        if (xhr.readyState === 4 && xhr.status === 200) console.log("TOKEN OK");
        else if (xhr.readyState === 4) window.location.href = "/index.html";
    }
    xhr.setRequestHeader("Authorization","Bearer " + token);
    xhr.send(null);
    window.setTimeout(checkToken, 20000);
}