import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

async function enrichOrderWithMenuItems(order) {
    order.orderItems = await Promise.all(
        order.orderItems.map(async (orderItem) => {
            try {
                const response = await fetch(`http://localhost:3000/menu/menu-items/${orderItem.menuItemId}`,{
                    method: 'GET'
                });
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                return {
                    ...orderItem,
                    menuItemDetails: data
                };
            } catch (error) {
                console.error(`Failed to fetch menuItemId ${orderItem.menuItemId}:`, error.message);
                return orderItem;
            }
        })
    );
    return order;
}
export async function generatePdfDoc() {
    let order = {
        "id":20,
        "customer":"ASD",
        "subtotal":780,
        "discountTotal":52.5,
        "total":727.5,
        "tip":0,
        "createdAt":"2024-11-28 02:45:54",
        "paymentMethod":null,
        "cancelledAt":null,
        "cancelReason":null,
        "status":"active",
        "claimedById":null,
        "billedById":null,
        "orderItems":[
            {
                "id":38,
                "menuItemId":2,
                "orderId":20,
                "promoId":null,
                "quantity":3,
                "subtotal":150,
                "discountApplied":0,
                "total":150,
                "promoName":null,
                "comments":null,
                "quantityHistory":[
                    {
                        "quantity":1,
                        "timestamp":"2024-11-28T02:45:57.641Z"
                    },
                    {
                        "quantity":1,
                        "timestamp":"2024-11-28T02:46:02.908Z"
                    },
                    {
                        "quantity":1,
                        "timestamp":"2024-11-28T02:46:06.481Z"
                    }
                ],
                "appliedPromos":[

                ]
            },
            {
                "id":39,
                "menuItemId":1,
                "orderId":20,
                "promoId":null,
                "quantity":6,
                "subtotal":630,
                "discountApplied":52.5,
                "total":577.5,
                "promoName":null,
                "comments":null,
                "quantityHistory":[
                    {
                        "quantity":1,
                        "timestamp":"2024-11-28T02:46:08.315Z"
                    },
                    {
                        "quantity":1,
                        "timestamp":"2024-11-28T02:46:10.928Z"
                    },
                    {
                        "quantity":1,
                        "timestamp":"2024-11-28T02:46:14.678Z"
                    },
                    {
                        "quantity":-1,
                        "timestamp":"2024-11-28T02:46:18.633Z"
                    },
                    {
                        "quantity":1,
                        "timestamp":"2024-11-28T02:46:53.210Z"
                    },
                    {
                        "quantity":1,
                        "timestamp":"2024-11-28T02:46:53.966Z"
                    },
                    {
                        "quantity":-1,
                        "timestamp":"2024-11-28T02:46:54.702Z"
                    },
                    {
                        "quantity":-1,
                        "timestamp":"2024-11-28T02:46:55.201Z"
                    },
                    {
                        "quantity":-1,
                        "timestamp":"2024-11-28T02:46:55.599Z"
                    },
                    {
                        "quantity":-1,
                        "timestamp":"2024-11-28T02:46:55.884Z"
                    },
                    {
                        "quantity":-1,
                        "timestamp":"2024-11-28T02:46:56.313Z"
                    },
                    {
                        "quantity":-1,
                        "timestamp":"2024-11-28T02:46:56.544Z"
                    },
                    {
                        "quantity":1,
                        "timestamp":"2024-11-28T02:46:57.948Z"
                    },
                    {
                        "quantity":1,
                        "timestamp":"2024-11-28T02:46:59.173Z"
                    },
                    {
                        "quantity":1,
                        "timestamp":"2024-11-28T02:46:59.305Z"
                    },
                    {
                        "quantity":1,
                        "timestamp":"2024-11-28T02:46:59.441Z"
                    },
                    {
                        "quantity":-1,
                        "timestamp":"2024-11-28T02:47:00.412Z"
                    },
                    {
                        "quantity":-1,
                        "timestamp":"2024-11-28T02:47:00.567Z"
                    },
                    {
                        "quantity":-1,
                        "timestamp":"2024-11-28T02:47:00.703Z"
                    },
                    {
                        "quantity":-1,
                        "timestamp":"2024-11-28T02:47:00.838Z"
                    },
                    {
                        "quantity":1,
                        "timestamp":"2024-11-28T02:47:08.617Z"
                    },
                    {
                        "quantity":1,
                        "timestamp":"2024-11-28T02:47:11.337Z"
                    },
                    {
                        "quantity":1,
                        "timestamp":"2024-11-28T02:47:11.637Z"
                    },
                    {
                        "quantity":1,
                        "timestamp":"2024-11-28T02:47:12.098Z"
                    },
                    {
                        "quantity":-1,
                        "timestamp":"2024-11-28T02:47:15.063Z"
                    },
                    {
                        "quantity":-1,
                        "timestamp":"2024-11-28T02:47:15.588Z"
                    },
                    {
                        "quantity":-1,
                        "timestamp":"2024-11-28T02:47:16.061Z"
                    },
                    {
                        "quantity":-1,
                        "timestamp":"2024-11-28T02:47:16.421Z"
                    },
                    {
                        "quantity":-1,
                        "timestamp":"2024-11-28T02:47:17.523Z"
                    },
                    {
                        "quantity":1,
                        "timestamp":"2024-11-28T02:47:18.612Z"
                    },
                    {
                        "quantity":1,
                        "timestamp":"2024-11-28T02:47:21.840Z"
                    },
                    {
                        "quantity":1,
                        "timestamp":"2024-11-28T02:47:23.599Z"
                    },
                    {
                        "quantity":1,
                        "timestamp":"2024-11-28T02:47:24.332Z"
                    },
                    {
                        "quantity":1,
                        "timestamp":"2024-11-28T02:47:27.195Z"
                    },
                    {
                        "quantity":1,
                        "timestamp":"2024-11-28T02:47:30.298Z"
                    },
                    {
                        "quantity":1,
                        "timestamp":"2024-11-28T02:47:30.947Z"
                    },
                    {
                        "quantity":1,
                        "timestamp":"2024-11-28T02:47:32.648Z"
                    },
                    {
                        "quantity":1,
                        "timestamp":"2024-11-28T02:47:33.519Z"
                    },
                    {
                        "quantity":1,
                        "timestamp":"2024-11-28T02:47:35.291Z"
                    },
                    {
                        "quantity":-1,
                        "timestamp":"2024-11-28T02:47:35.722Z"
                    },
                    {
                        "quantity":-1,
                        "timestamp":"2024-11-28T02:47:35.870Z"
                    },
                    {
                        "quantity":-1,
                        "timestamp":"2024-11-28T02:47:36.008Z"
                    },
                    {
                        "quantity":-1,
                        "timestamp":"2024-11-28T02:47:36.133Z"
                    },
                    {
                        "quantity":-1,
                        "timestamp":"2024-11-28T02:47:36.277Z"
                    },
                    {
                        "quantity":-1,
                        "timestamp":"2024-11-28T02:47:36.404Z"
                    },
                    {
                        "quantity":-1,
                        "timestamp":"2024-11-28T02:47:36.545Z"
                    },
                    {
                        "quantity":-1,
                        "timestamp":"2024-11-28T02:47:36.682Z"
                    },
                    {
                        "quantity":-1,
                        "timestamp":"2024-11-28T02:47:36.825Z"
                    },
                    {
                        "quantity":-1,
                        "timestamp":"2024-11-28T02:47:37.514Z"
                    },
                    {
                        "quantity":-1,
                        "timestamp":"2024-11-28T02:47:37.646Z"
                    },
                    {
                        "quantity":-1,
                        "timestamp":"2024-11-28T02:47:37.794Z"
                    },
                    {
                        "quantity":1,
                        "timestamp":"2024-11-28T02:48:19.770Z"
                    },
                    {
                        "quantity":1,
                        "timestamp":"2024-11-28T02:48:20.528Z"
                    },
                    {
                        "quantity":-1,
                        "timestamp":"2024-11-28T02:48:21.169Z"
                    },
                    {
                        "quantity":-1,
                        "timestamp":"2024-11-28T02:48:21.543Z"
                    },
                    {
                        "quantity":1,
                        "timestamp":"2024-11-28T02:48:22.044Z"
                    },
                    {
                        "quantity":1,
                        "timestamp":"2024-11-28T02:48:22.308Z"
                    },
                    {
                        "quantity":1,
                        "timestamp":"2024-11-28T02:48:22.760Z"
                    },
                    {
                        "quantity":1,
                        "timestamp":"2024-11-28T02:48:23.164Z"
                    },
                    {
                        "quantity":1,
                        "timestamp":"2024-11-28T02:48:23.525Z"
                    },
                    {
                        "quantity":1,
                        "timestamp":"2024-11-28T02:48:24.098Z"
                    }
                ],
                "appliedPromos":[
                    {
                        "promoId":1,
                        "promoName":"POLLO 50%",
                        "quantity":1,
                        "discountApplied":52.5,
                        "timestamp":"2024-11-28T02:46:08.315Z",
                        "type":"percentage_discount"
                    },
                    {
                        "promoId":1,
                        "promoName":"POLLO 50%",
                        "quantity":2,
                        "discountApplied":105,
                        "timestamp":"2024-11-28T02:46:10.928Z",
                        "type":"percentage_discount"
                    },
                    {
                        "promoId":1,
                        "promoName":"POLLO 50%",
                        "quantity":3,
                        "discountApplied":157.5,
                        "timestamp":"2024-11-28T02:46:14.678Z",
                        "type":"percentage_discount"
                    },
                    {
                        "promoId":1,
                        "promoName":"POLLO 50%",
                        "quantity":4,
                        "discountApplied":210,
                        "timestamp":"2024-11-28T02:46:18.633Z",
                        "type":"percentage_discount"
                    },
                    {
                        "promoId":1,
                        "promoName":"POLLO 50%",
                        "quantity":3,
                        "discountApplied":157.5,
                        "timestamp":"2024-11-28T02:46:53.210Z",
                        "type":"percentage_discount"
                    },
                    {
                        "promoId":1,
                        "promoName":"POLLO 50%",
                        "quantity":4,
                        "discountApplied":210,
                        "timestamp":"2024-11-28T02:46:53.966Z",
                        "type":"percentage_discount"
                    },
                    {
                        "promoId":1,
                        "promoName":"POLLO 50%",
                        "quantity":3,
                        "discountApplied":157.5,
                        "timestamp":"2024-11-28T02:46:54.702Z",
                        "type":"percentage_discount"
                    },
                    {
                        "promoId":1,
                        "promoName":"POLLO 50%",
                        "quantity":2,
                        "discountApplied":105,
                        "timestamp":"2024-11-28T02:46:55.201Z",
                        "type":"percentage_discount"
                    },
                    {
                        "promoId":1,
                        "promoName":"POLLO 50%",
                        "quantity":1,
                        "discountApplied":52.5,
                        "timestamp":"2024-11-28T02:46:55.599Z",
                        "type":"percentage_discount"
                    },
                    {
                        "promoId":1,
                        "promoName":"POLLO 50%",
                        "quantity":1,
                        "discountApplied":52.5,
                        "timestamp":"2024-11-28T02:46:59.305Z",
                        "type":"percentage_discount"
                    },
                    {
                        "promoId":1,
                        "promoName":"POLLO 50%",
                        "quantity":2,
                        "discountApplied":105,
                        "timestamp":"2024-11-28T02:46:59.441Z",
                        "type":"percentage_discount"
                    },
                    {
                        "promoId":1,
                        "promoName":"POLLO 50%",
                        "quantity":1,
                        "discountApplied":52.5,
                        "timestamp":"2024-11-28T02:47:00.412Z",
                        "type":"percentage_discount"
                    },
                    {
                        "promoId":1,
                        "promoName":"POLLO 50%",
                        "quantity":1,
                        "discountApplied":52.5,
                        "timestamp":"2024-11-28T02:47:11.637Z",
                        "type":"percentage_discount"
                    },
                    {
                        "promoId":1,
                        "promoName":"POLLO 50%",
                        "quantity":2,
                        "discountApplied":105,
                        "timestamp":"2024-11-28T02:47:12.098Z",
                        "type":"percentage_discount"
                    },
                    {
                        "promoId":1,
                        "promoName":"POLLO 50%",
                        "quantity":1,
                        "discountApplied":52.5,
                        "timestamp":"2024-11-28T02:47:15.063Z",
                        "type":"percentage_discount"
                    },
                    {
                        "promoId":1,
                        "promoName":"POLLO 50%",
                        "quantity":1,
                        "discountApplied":52.5,
                        "timestamp":"2024-11-28T02:47:24.332Z",
                        "type":"percentage_discount"
                    },
                    {
                        "promoId":1,
                        "promoName":"POLLO 50%",
                        "quantity":2,
                        "discountApplied":105,
                        "timestamp":"2024-11-28T02:47:27.195Z",
                        "type":"percentage_discount"
                    },
                    {
                        "promoId":1,
                        "promoName":"POLLO 50%",
                        "quantity":3,
                        "discountApplied":157.5,
                        "timestamp":"2024-11-28T02:47:30.298Z",
                        "type":"percentage_discount"
                    },
                    {
                        "promoId":1,
                        "promoName":"POLLO 50%",
                        "quantity":4,
                        "discountApplied":210,
                        "timestamp":"2024-11-28T02:47:30.947Z",
                        "type":"percentage_discount"
                    },
                    {
                        "promoId":1,
                        "promoName":"POLLO 50%",
                        "quantity":5,
                        "discountApplied":262.5,
                        "timestamp":"2024-11-28T02:47:32.648Z",
                        "type":"percentage_discount"
                    },
                    {
                        "promoId":1,
                        "promoName":"POLLO 50%",
                        "quantity":6,
                        "discountApplied":315,
                        "timestamp":"2024-11-28T02:47:33.519Z",
                        "type":"percentage_discount"
                    },
                    {
                        "promoId":1,
                        "promoName":"POLLO 50%",
                        "quantity":7,
                        "discountApplied":367.5,
                        "timestamp":"2024-11-28T02:47:35.291Z",
                        "type":"percentage_discount"
                    },
                    {
                        "promoId":1,
                        "promoName":"POLLO 50%",
                        "quantity":6,
                        "discountApplied":315,
                        "timestamp":"2024-11-28T02:47:35.722Z",
                        "type":"percentage_discount"
                    },
                    {
                        "promoId":1,
                        "promoName":"POLLO 50%",
                        "quantity":5,
                        "discountApplied":262.5,
                        "timestamp":"2024-11-28T02:47:35.870Z",
                        "type":"percentage_discount"
                    },
                    {
                        "promoId":1,
                        "promoName":"POLLO 50%",
                        "quantity":4,
                        "discountApplied":210,
                        "timestamp":"2024-11-28T02:47:36.008Z",
                        "type":"percentage_discount"
                    },
                    {
                        "promoId":1,
                        "promoName":"POLLO 50%",
                        "quantity":3,
                        "discountApplied":157.5,
                        "timestamp":"2024-11-28T02:47:36.133Z",
                        "type":"percentage_discount"
                    },
                    {
                        "promoId":1,
                        "promoName":"POLLO 50%",
                        "quantity":2,
                        "discountApplied":105,
                        "timestamp":"2024-11-28T02:47:36.277Z",
                        "type":"percentage_discount"
                    },
                    {
                        "promoId":1,
                        "promoName":"POLLO 50%",
                        "quantity":1,
                        "discountApplied":52.5,
                        "timestamp":"2024-11-28T02:47:36.404Z",
                        "type":"percentage_discount"
                    },
                    {
                        "promoId":1,
                        "promoName":"POLLO 50%",
                        "quantity":1,
                        "discountApplied":52.5,
                        "timestamp":"2024-11-28T02:48:24.098Z",
                        "type":"percentage_discount"
                    }
                ]
            }
        ]
    }
    let data = await enrichOrderWithMenuItems(order)
    let ticketData = extractOrderDetails(data);
    const ticketWidth = 70;
    const ticketHeight = 140;
    const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: [ticketWidth, ticketHeight],
    });
    let restaurantData = {
        name: 'La yuru',
        address: 'Av Jose Diaz Bolio x 10 y 12, Col. México',
        phone: '999 263 1883'
    }
    let currentDate = getFormattedDate();
    let currentHour = getCurrentHour();

    const centerX = ticketWidth / 2;
    let currentY = 0;
    appendHeader(currentY, centerX, pdf);
    appendDateTime(currentDate, currentHour, currentY, pdf);
    appendTable(ticketData, pdf, centerX);
    let tableYPosition = pdf.autoTable.previous.finalY;
    pdf.text('----------------------------------------------------------', 10, tableYPosition+5);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(12);
    pdf.text('Gracias Por tu Compra!',10, 100);
    saveDocToPdf(pdf);
}

function appendDateTime(currentDate, currentHour, currentY, pdf){
    let ticketWidth = 70;
    let ticketHeight = 140;
    let centerX = ticketWidth / 2;
    pdf.text(`Fecha: ${currentDate}`, 10, 40);
    pdf.text(`Hora: ${currentDate}`, 10, 43);
    pdf.text('----------------------------------------------------------', 10, 45);
}

function extractOrderDetails(response) {
    const rows = [];

    response.orderItems.forEach(item => {
        const menuItemDetails = item.menuItemDetails;

        if (menuItemDetails && menuItemDetails.name && menuItemDetails.price) {
            // Add a row with the item details (name, quantity, price) as an array
            rows.push([menuItemDetails.name, item.quantity, menuItemDetails.price]);

            // If there's a discount, add it as a new row with negative price
            if (item.discountApplied !== 0) {
                rows.push(['descuento', "", -item.discountApplied]);
            }
        }
    });

    // Add a final row with the total of the order
    rows.push(['total', "", response.total]);

    return rows;
}

function saveDocToPdf(doc){
    doc.save();
}

function getFormattedDate() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function getCurrentHour() {
    const now = new Date();
    return now.getHours();
}

function appendHeader(currentY, centerX, pdf){
    let restaurantData = {
        name: 'La yuru',
        address: 'Av Jose Diaz Bolio x 10 y 12, Col. México',
        phone: '999 263 1883'
    }
    currentY += 20;
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(16);
    pdf.text(restaurantData.name, centerX, currentY, { align: "center" });
    pdf.setFontSize(7)
    currentY += 5
    pdf.setFont("helvetica", "italic");
    pdf.text(restaurantData.address, centerX, currentY, { align: "center" });
    currentY += 5;
    pdf.text(restaurantData.phone, centerX, currentY, { align: "center" });
}

function appendTable(tableBody, doc, centerX) {
    const headers = [["Producto", "Cantidad", "Precio"]];


    autoTable(doc, {
        startY: 45,
        head: [['Producto', 'Cantidad', 'Precio']],
        body: tableBody,
        styles: {
            fontSize: 6,
            halign: 'center',
        },
        headStyles: {
            fillColor: [255, 255, 255],
            textColor: [0, 0, 0],
            fontSize: 6,
            halign: 'center',
        },
        columnStyles: {
            0: { halign: "center", cellWidth: 15, cellPadding:1},
            1: { halign: "center", cellWidth: 15, cellPadding:1},
            2: { halign: "center", cellWidth: 15, cellPadding:1},
        },
        theme: 'plain',
    });
    return doc;
}
