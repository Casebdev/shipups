// *****************************************************************
//  UPS Shipping API access proof of concept
//
//  This makes use of the UPS shipping API to request shipping 
//  quotes for Sun-Mar
//
//  Requests an access token from the server using sun-mar creds
//
//  There are separate creds for the canada and USA accounts. These
//  are accesse from the developer portal once logged into the main 
//  UPS accounts
//
// Shop with Time in Transit - access points (www.cie is the development server)
//
// https://onlinetools.ups.com/api/rating/v2403/shop?additionalinfo=timeintransit
// https://wwwcie.ups.com/api/rating/v2403/shop?additionalinfo=timeintransit
//
//
// USA account and Creds
//
// Account:    529YW9
// client ID:  sonvmY8MAKg9r9oIrcCrEEKFARF4tWZ7o29bpb0IoYjtVik9
// Secret:     MwAq5UPyFj0C4e0CAQk233SIYXmyYW28xWD0LjHsuZsJUSsEMK0keDG0Sm8x7GCd
//
// Canada Account and creds
//
// Account:    8X2237
// Client ID:  1deelbPDCmpH2YNWAY5QwYkXvfQpbRUC5Y2Eyb57aklLsSUG
// Secret:     DuhCGBAKPuWSUGegy156KVgkPzz3W4bmN60cxlfH2fZhza2gnWFhaHYET2rGYNLD
//
// *****************************************************************
var readlineSync = require('readline-sync');

//global variables  
var dstPc;
var length;
var width;
var height;
var weight;

//inputs - default
dstPc='K0A1X0';
weight='33';
length='91.5';
width='71.1';
height='81.2';


// ******************************************************************
//  run()
//
//  Main entry point
//
// ******************************************************************
async function run() 
{
var resp;
var data;
var data2;
var info;
var url;
var i;
var indata;

//user input
console.log(" ");
console.log("Enter destination and package information");
console.log("-----------------------------------------");
indata=readlineSync.question('Destination postal code ('+dstPc+'): ').toUpperCase();
if(indata!="") dstPc=indata;

indata=readlineSync.question('Weight [kg] ('+weight+'): ').toUpperCase();
if(indata!="") weight=indata;

indata=readlineSync.question('Length [cm] ('+length+'): ').toUpperCase();
if(indata!="") length=indata;

indata=readlineSync.question('Width [cm] ('+width+'): ').toUpperCase();
if(indata!="") width=indata;

indata=readlineSync.question('Height [cm] ('+height+'): ').toUpperCase();
if(indata!="") height=indata;


//form data structured information for the body of the access token request
const formData=
  {
  grant_type: 'client_credentials'
  };

//access the API to request an access token, authorization information is the client IS and 
//client secret from the UPS developer portal for Sun-Mar
resp=await fetch(`https://wwwcie.ups.com/security/v1/oauth/token`,
    {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'x-merchant-id': '8X2237',
      Authorization: 'Basic ' + Buffer.from('1deelbPDCmpH2YNWAY5QwYkXvfQpbRUC5Y2Eyb57aklLsSUG:DuhCGBAKPuWSUGegy156KVgkPzz3W4bmN60cxlfH2fZhza2gnWFhaHYET2rGYNLD').toString('base64')
    },
    body: new URLSearchParams(formData).toString()
    });

data=await resp.json();

//error processing
if(resp.status!=200)
  {
  console.log(" ");
  console.log("Error requesting Authentication:");
  console.log("--------------------------------");
  console.log("Status: ",resp.status," ",resp.statusText);
   
  for(i=0;i<data.response.errors.length;i++)
    {
	console.log("Code: ",data.response.errors[i].code,"  ",data.response.errors[i].message);
    }
  console.log(" ");
  return;
  };

//success processing

//console.log(" ");
//console.log("Authentication result:");
//console.log(JSON.stringify(data))
//console.log("------------------------");

//create URL information for the http request to the rating service
const query=new URLSearchParams(
  {
  additionalinfo: 'timeintransit'
  }).toString();

const version = 'v2403';
const requestoption = 'shop';
url=`https://wwwcie.ups.com/api/rating/${version}/${requestoption}?${query}`;

//access the API for the rating service, this uses the access token generated from the 
//previous API call
resp=await fetch(url,
  {
  method: 'POST',
  headers: 
    {
    'Content-Type': 'application/json',
    transId: '123456',
    transactionSrc: 'testing',
    Authorization: 'Bearer '+data.access_token
    },
  body: JSON.stringify(
    {
    RateRequest: 
	  {
      Request: 
	    {
        TransactionReference: 
		  {
          CustomerContext: 'CustomerContext'
          }
        },
	  CustomerClassification:
	    {
	    Code: '00'
	    },
      Shipment: 
	    {
        Shipper: 
		  {
          Name: 'Sun_mar',
          ShipperNumber: '8X2237',
          Address: 
		    {
            AddressLine: 
			   [
               '5-384 Millen Road'
               ],
            City: 'Stoney Creek',
            StateProvinceCode: 'ON',
            PostalCode: 'L8E2P7',
            CountryCode: 'CA'
            }
          },
        ShipTo: 
		  {
          Name: '',
          Address: 
		    {
            AddressLine: 
			  [
              ''
              ],
            City: '',
            StateProvinceCode: '',
            PostalCode: 'K0A1X0',
            CountryCode: 'CA',
			ResidentialAddressIndicator: '1'
            }
          },
		  
        NumOfPieces: '1',
        Package: 
		  {
          PackagingType: 
		    {
            Code: '02',
            Description: 'Packaging'
            },
          Dimensions: 
		    {
            UnitOfMeasurement: 
			  {
              Code: 'CM',
              Description: 'Centimeters'
              },
            Length: length,
            Width: width,
            Height: height
            },
          PackageWeight: 
		    {
            UnitOfMeasurement: 
			  {
              Code: 'KGS',
              Description: 'Killograms'
              },
            Weight: weight
            }
          },
        ShipmentTotalWeight: 
		  {
          UnitOfMeasurement: 
		    {
            Code: 'KGS',
            Description: 'Killograms'
            },
          Weight: weight
          },		  
        DeliveryTimeInformation: 
		  {
          PackageBillType: '03'
		  },	
		TaxInformationIndicator: '1'  
        }
      }
    })
  });

data2 = await resp.json();

//error from the server
if(resp.status!=200)
  {
  console.log(" ");
  console.log("Error requesting UPS Rates:");
  console.log("---------------------------");
  console.log("Status: ",resp.status," ",resp.statusText);
   
  for(i=0;i<data2.response.errors.length;i++)
    {
	console.log("Code: ",data2.response.errors[i].code,"  ",data2.response.errors[i].message);
    }
  console.log(" ");
  return;
  };
  
//success from the server

//console.log(" ");
//console.log("Shop result:");
//console.log("URL: ",url);
//console.log(JSON.stringify(data2));
//console.log("-------------------");
//console.log(" ");

console.log(" ");
console.log("UPS Rates:");
console.log("---------------------------");
console.log("From Sun-Mar to ",dstPc);
console.log("Weight:",weight,"  Length:",length,"  Width: ",width,"  Height: ",height);
console.log("Price is shown with all taxes included");
for(i=0;i<data2.RateResponse.RatedShipment.length;i++)
  {
  console.log(" ");
  console.log("Service: ",data2.RateResponse.RatedShipment[i].TimeInTransit.ServiceSummary.Service.Description,"",data2.RateResponse.RatedShipment[i].Service.Code," ",data2.RateResponse.RatedShipment[i].TotalChargesWithTaxes.MonetaryValue," Arrive:",data2.RateResponse.RatedShipment[i].TimeInTransit.ServiceSummary.EstimatedArrival.Arrival.Date);

  for(j=0;j<data2.RateResponse.RatedShipment[i].RatedShipmentAlert.length;j++)
    {
	console.log("  Alert: ",data2.RateResponse.RatedShipment[i].RatedShipmentAlert[j].Code,": ",data2.RateResponse.RatedShipment[i].RatedShipmentAlert[j].Description); 
    };
  }
console.log(" ");
}

//run the system
run();
