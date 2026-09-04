// 0. Auto-fill the text box when a template is selected
function fillTemplate() {
    const template = document.getElementById("messageTemplate").value;
    const textBox = document.getElementById("messageText");
    if (template !== "") textBox.value = template;
}

// 1. Generate the shareable link (With Image Upload!)
async function generateLink() {
    const teacher = document.getElementById("teacherName").value.trim();
    const student = document.getElementById("studentName").value.trim();
    const message = document.getElementById("messageText").value.trim();
    const photoFile = document.getElementById("photoUpload").files[0];
    const btn = document.querySelector(".pro-btn");

    if (!teacher || !student || !message) {
        alert("Please fill in the names and message to create a beautiful card!");
        return;
    }

    btn.innerText = "⏳ Generating Link...";
    btn.disabled = true;

    let finalPhotoUrl = "";

    if (photoFile) {
        const formData = new FormData();
        formData.append("image", photoFile);
        const apiKey = '2ac80e9d86eacf85cb0d55be620091b0'; 
        
        try {
            const response = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
                method: "POST",
                body: formData
            });
            const data = await response.json();
            finalPhotoUrl = data.data.url; 
        } catch (error) {
            alert("Photo upload failed, but we will still create the card without it.");
        }
    }

    const paramsObj = { t: teacher, s: student, m: message };
    if (finalPhotoUrl !== "") paramsObj.p = finalPhotoUrl; 

    const params = new URLSearchParams(paramsObj);
    const baseUrl = window.location.origin + window.location.pathname;
    const shareableLink = baseUrl + "?" + params.toString();

    document.getElementById("link-output").style.display = "block";
    document.getElementById("generatedLink").value = shareableLink;
    
    // Reset button
    btn.innerText = "Create Shareable Link";
    btn.disabled = false;
}

// 2. Dedicated Copy Button Logic
function copyToClipboard() {
    const linkInput = document.getElementById("generatedLink");
    const copyBtn = document.getElementById("copyBtn");
    
    // Select the text (Ensures it works perfectly on mobile screens)
    linkInput.select();
    linkInput.setSelectionRange(0, 99999);
    
    // Use the modern Clipboard API
    navigator.clipboard.writeText(linkInput.value).then(() => {
        // Change the button to show success!
        copyBtn.innerHTML = "✅ Copied!";
        copyBtn.style.background = "#059669"; // Success Green
        
        // Reset the button back to normal after 2 seconds
        setTimeout(() => {
            copyBtn.innerHTML = "📋 Copy Link";
            copyBtn.style.background = "#1a1a1a";
        }, 2000);
    }).catch(() => {
        // Fallback just in case the browser is older
        document.execCommand("copy");
        copyBtn.innerHTML = "✅ Copied!";
    });
}

// 3. Check the URL when the page loads
window.onload = function() {
    const params = new URLSearchParams(window.location.search);
    
    if (params.has("t") && params.has("s") && params.has("m")) {
        document.getElementById("creator-section").style.display = "none";
        document.getElementById("greeting-section").style.display = "block";
        
        document.getElementById("greetTeacherName").innerText = "Dear " + params.get("t") + ",";
        document.getElementById("greetMessageText").innerText = params.get("m");
        document.getElementById("greetStudentName").innerText = "- From, " + params.get("s");

        // Swap the image if a custom photo URL was provided via ImgBB API
        if (params.has("p")) {
            document.getElementById("customTeacherWrapper").style.display = "flex";
            document.getElementById("teacherPhoto").src = params.get("p");
            
            let tName = params.get("t");
            if(tName.length > 12) tName = tName.substring(0, 10) + "..."; 
            document.getElementById("customTeacherLabel").innerText = tName;
        }
    }
}