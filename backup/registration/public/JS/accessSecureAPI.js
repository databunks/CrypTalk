function getSecureAPI()
{
    var xhr = new XMLHttpRequest();
    xhr.open('GET', 'https://us-central1-cryptalk-72a10.cloudfunctions.net/homePage');
    xhr.setRequestHeader('Authorization', 'Bearer ' + getCookie('accessToken'));
    xhr.send(null);
    xhr.onreadystatechange = function ()
    {
        console.log("test2");
        if (xhr.readyState === 4 && xhr.status === 200)
        {
            response.innerHTML = xhr.responseText;
            console.log("suc");
        }
        else
        {   
            response.innerHTML = "Unauthorized endpoint";
            console.log("nope");
        }

        
    }
}

function getCookie (cname)
{
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for(var i = 0; i < ca.length; i++)
    {
        var c = ca[i];
        while (c.charAt(0) == ' ')
        {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0)
        {
            return c.substring(name.length,c.length);
        }
    }
    return "";
}