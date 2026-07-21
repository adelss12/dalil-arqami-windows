const importButton = document.getElementById("importButton");
const vcfInput = document.getElementById("vcfInput");

importButton.addEventListener("click", function () {
    vcfInput.click();
});
vcfInput.addEventListener("change", function () {
    const file = vcfInput.files[0];

    if (!file) {
        return;
    }

    const reader = new FileReader();

    reader.onload = function () {
        const vcfText = reader.result;

const contactCards = vcfText
    .split(/END:VCARD/i)
    .filter(card => card.includes("BEGIN:VCARD"));

const names = contactCards.map(function (card) {
    const nameLine = card.match(/^FN(?:;[^:]*)?:(.*)$/mi);
    return nameLine ? nameLine[1].trim() : "بدون اسم";
});

const contacts = contactCards.map(function (card) {
    const nameLine = card.match(/^FN(?:;[^:]*)?:(.*)$/mi);

    const phoneLines = [
        ...card.matchAll(/^TEL(?:;[^:]*)?:(.*)$/gmi)
    ];

    return {
        name: nameLine ? nameLine[1].trim() : "بدون اسم",

        phones: phoneLines.map(function (result) {
            return result[1].trim();
        })
    };
});
localStorage.setItem("dalilContacts", JSON.stringify(contacts));
document.getElementById("contactsCount").textContent =
    `عدد الأسماء: ${contacts.length}`;
const contactsList = document.getElementById("contactsList");
contactsList.innerHTML = "";

contacts.forEach(function (contact) {
    const contactItem = document.createElement("div");
    contactItem.className = "contact-item";

    const contactName = document.createElement("h3");
    contactName.textContent = contact.name;

    const contactPhones = document.createElement("p");
    contactPhones.textContent =
        contact.phones.length > 0
            ? contact.phones.join(" • ")
            : "لا يوجد رقم هاتف";

    contactItem.appendChild(contactName);
    contactItem.appendChild(contactPhones);
    contactsList.appendChild(contactItem);
    
});

    };

    reader.readAsText(file, "UTF-8");
});
const savedContacts = JSON.parse(
    localStorage.getItem("dalilContacts") || "[]"
);

if (savedContacts.length > 0) {
    const savedContactsList = document.getElementById("contactsList");
    savedContactsList.innerHTML = "";

    savedContacts.forEach(function (contact) {
        const contactItem = document.createElement("div");
        contactItem.className = "contact-item";

        const contactName = document.createElement("h3");
        contactName.textContent = contact.name;

        const contactPhones = document.createElement("p");
        contactPhones.textContent =
            contact.phones.length > 0
                ? contact.phones.join(" • ")
                : "لا يوجد رقم هاتف";

        contactItem.appendChild(contactName);
        contactItem.appendChild(contactPhones);
        savedContactsList.appendChild(contactItem);
    });
}
const searchInput = document.getElementById("searchInput");

searchInput.addEventListener("input", function () {
    const searchText = searchInput.value.trim().toLowerCase();
    const contactItems = document.querySelectorAll(".contact-item");

    let visibleCount = 0;

    contactItems.forEach(function (item) {
        const contactText = item.textContent.toLowerCase();
        const isMatch = contactText.includes(searchText);

        item.style.display = isMatch ? "block" : "none";

        if (isMatch) {
            visibleCount++;
        }
    });

    const totalContacts = JSON.parse(
        localStorage.getItem("dalilContacts") || "[]"
    ).length;

    document.getElementById("contactsCount").textContent =
        searchText
            ? `نتائج البحث: ${visibleCount} من ${totalContacts}`
            : `عدد الأسماء: ${totalContacts}`;
});
    const deleteAllButton = document.getElementById("deleteAllButton");

deleteAllButton.addEventListener("click", function () {
    const storedContacts = JSON.parse(
    localStorage.getItem("dalilContacts") || "[]"
);

const confirmed = confirm(
    `هل أنت متأكد من حذف جميع الأسماء وعددها ${storedContacts.length}؟`
);

    if (!confirmed) {
        return;
    }

    localStorage.removeItem("dalilContacts");
    document.getElementById("contactsCount").textContent =
    "عدد الأسماء: 0";

    document.getElementById("contactsList").innerHTML = `
        <div class="empty-state">
            <h2>دليلك جاهز</h2>
            <p>استورد ملف جهات الاتصال VCF للبدء.</p>
        </div>
    `;

    searchInput.value = "";
});
const exportButton = document.getElementById("exportButton");

exportButton.addEventListener("click", function () {
    const contactsToExport = JSON.parse(
        localStorage.getItem("dalilContacts") || "[]"
    );

    if (contactsToExport.length === 0) {
        alert("لا توجد أسماء لتصديرها");
        return;
    }

    const vcfContent = contactsToExport.map(function (contact) {
        const safeName = contact.name
            .replace(/\\/g, "\\\\")
            .replace(/,/g, "\\,")
            .replace(/;/g, "\\;")
            .replace(/\n/g, "\\n");

        const phoneLines = contact.phones
            .map(function (phone) {
                return `TEL:${phone}`;
            })
            .join("\r\n");

        return [
            "BEGIN:VCARD",
            "VERSION:3.0",
            `FN:${safeName}`,
            phoneLines,
            "END:VCARD"
        ].filter(Boolean).join("\r\n");
    }).join("\r\n");

    const file = new Blob([vcfContent], {
        type: "text/vcard;charset=utf-8"
    });

    const downloadLink = document.createElement("a");
    downloadLink.href = URL.createObjectURL(file);
    const now = new Date();

const day = String(now.getDate()).padStart(2, "0");
const month = String(now.getMonth() + 1).padStart(2, "0");
const year = now.getFullYear();
const hours = String(now.getHours()).padStart(2, "0");
const minutes = String(now.getMinutes()).padStart(2, "0");

downloadLink.download =
    `contacts-${contactsToExport.length}-${day}-${month}-${year}_${hours}-${minutes}.vcf`;
    downloadLink.click();

    URL.revokeObjectURL(downloadLink.href);
});
const contactsCount = document.getElementById("contactsCount");

const currentContacts = JSON.parse(
    localStorage.getItem("dalilContacts") || "[]"
);

contactsCount.textContent =
    `عدد الأسماء: ${currentContacts.length}`;
    const csvExportButton =
    document.getElementById("csvExportButton");

csvExportButton.addEventListener("click", function () {
    const contactsToExport = JSON.parse(
        localStorage.getItem("dalilContacts") || "[]"
    );

    if (contactsToExport.length === 0) {
        alert("لا توجد أسماء لتصديرها");
        return;
    }

    const maximumPhones = Math.max(
        1,
        ...contactsToExport.map(function (contact) {
            return contact.phones.length;
        })
    );

    const headers = ["الاسم"];

    for (let number = 1; number <= maximumPhones; number++) {
        headers.push(`رقم الهاتف ${number}`);
    }

    function csvCell(value) {
        return `"${String(value).replace(/"/g, '""')}"`;
    }

    const rows = contactsToExport.map(function (contact) {
        const row = [csvCell(contact.name)];

        for (let index = 0; index < maximumPhones; index++) {
            const phone = contact.phones[index] || "";

            const excelPhone = phone
                ? `="${phone.replace(/"/g, '""')}"`
                : "";

            row.push(csvCell(excelPhone));
        }

        return row.join(",");
    });

    const csvContent = [
        "sep=,",
        headers.map(csvCell).join(","),
        ...rows
    ].join("\r\n");

    const file = new Blob(
        ["\uFEFF" + csvContent],
        { type: "text/csv;charset=utf-8" }
    );

    const now = new Date();
    const day = String(now.getDate()).padStart(2, "0");
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const year = now.getFullYear();
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");

    const downloadLink = document.createElement("a");
    downloadLink.href = URL.createObjectURL(file);
    downloadLink.download =
        `contacts-${contactsToExport.length}-${day}-${month}-${year}_${hours}-${minutes}.csv`;

    downloadLink.click();
    URL.revokeObjectURL(downloadLink.href);
});