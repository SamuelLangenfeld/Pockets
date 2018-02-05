var request = require("request");
const fetch = require("node-fetch");

let baseURI = "http://localhost:3005";

let loggedInOnlyMessage = "Logged In Only";
let loggedOutOnlyMessage = "Already logged in";
let validUser = { username: "hooligan0", password: "password0" };

const fetchRequest = async (url, options) => {
  return fetch(url, options).then(response => {
    return response;
  });
};

describe("server", () => {
  beforeAll(function() {
    //we start express app here
    var app = require("../../app.js");
    var server = app.listen(3005, "localhost");
    var Cookies;
  });

  it("returns status 401 for logged in only routes", async done => {
    let response = await fetchRequest(baseURI + "/logout");
    expect(response.status).toBe(401);
    response = await fetchRequest(baseURI + "/users");
    expect(response.status).toBe(401);
    response = await fetchRequest(baseURI + "/items");
    expect(response.status).toBe(401);
    response = await fetchRequest(baseURI + "/pouches");
    expect(response.status).toBe(401);
    done();
  });

  describe("POST /login", () => {
    it("logs in and returns a valid user", async done => {
      let response = await fetchRequest(baseURI + "/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validUser)
      });
      let user = await response.json();
      expect(user._id).toBeTruthy();
      expect(user.username).toBeTruthy();
      expect(user.email).toBeTruthy();

      Cookies = response.headers._headers["set-cookie"]
        .map(function(r) {
          return r.replace("; path=/; httponly", "");
        })
        .join("; ");
      done();
    });
  });

  it("returns logged out only message for logged out only routes", async done => {
    let response = await fetch(baseURI + "/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(validUser)
    });
    console.log(response);
    response = await response.json();
    expect(response.message).toBe(loggedInOnlyMessage);
    response = await fetchRequest(baseURI + "/register");
    expect(response.message).toBe(loggedInOnlyMessage);
    done();
  });
});
