function getSecureAPI(page)
{
    var xhr = new XMLHttpRequest();
    xhr.open('GET', page);
    xhr.setRequestHeader('Authorization', 'Bearer ' + getCookie('accessToken'));
    xhr.send(null);
    xhr.onreadystatechange = function ()
    {
        console.log("test2");
        if (xhr.readyState === 4 && xhr.status === 200)
        {
            response.innerHTML = xhr.responseText;
        }
        else
        {   
            response.innerHTML = "Unauthorized endpoint";
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