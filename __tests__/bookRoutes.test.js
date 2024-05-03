process.env.NODE_ENV = "test";

const request = require("supertest");
const app = require('../app');
const db = require('../db');
const Test = require("supertest/lib/test");

let b1;
let bookData;

beforeEach(async function() {
    let results = await db.query("INSERT INTO books (isbn, title, author, year, pages, publisher, language, amazon_url) VALUES ('1234567890', 'The Hobbit', 'JRR Tolkien', 1937, 220, 'HarperCollins', 'English', 'https://www.amazon.com/Hobbit-JRR-Tolkien-ebook/dp/B004K19Y76') RETURNING *");

    b1 = results.rows[0];
    bookData = {
        "isbn": "0691161518",
        "amazon_url": "http://a.co/eobPtX2",
        "author": "Matthew Lane",
        "language": "english",
        "pages": 264,
        "publisher": "Princeton University Press",
        "title": "Power-Up: Unlocking the Hidden Mathematics in Video Games",
        "year": 2017
      }
})
afterEach(async function(){
    await db.query("DELETE FROM books");

})

/** GET /books - returns `{books: [book,...]}`. */
describe("GET /books", function(){
    test("Gets a list of books", async function() {
        const resp = await request(app).get("/books");
        expect(resp.statusCode).toBe(200);

        expect(resp.body).toEqual({books: [
            {
                isbn: '1234567890',
                title: 'The Hobbit',
                author: 'JRR Tolkien',
                year: 1937,
                pages: 220,
                publisher: 'HarperCollins',
                language: 'English',
                amazon_url: 'https://www.amazon.com/Hobbit-JRR-Tolkien-ebook/dp/B004K19Y76'
            }
        ]});
    })
})

/* GET /books/:isbn - returns `{book}` */
describe("GET /books/:isbn", function() {
    test("Gets a book by its isbn", async function() {
        const res = await request(app).get(`/books/${b1.isbn}`);

        expect(res.statusCode).toEqual(200);
        
        expect(res.body).toEqual({book: b1});
    })

    test("isbn that doesn't exist returns error", async function(){
        const fakeIsbn = "123123321321";
        const res = await request(app).get(`/books/${fakeIsbn}`);

        expect(res.statusCode).toEqual(404);
    })
})

describe("POST /books", function() {
    test("creates new book given proper data", async function() {
        const bookData = {
            "isbn": "0691161518",
            "amazon_url": "http://a.co/eobPtX2",
            "author": "Matthew Lane",
            "language": "english",
            "pages": 264,
            "publisher": "Princeton University Press",
            "title": "Power-Up: Unlocking the Hidden Mathematics in Video Games",
            "year": 2017
          }
        const res = await request(app).post(`/books`).send(bookData);

        expect(res.statusCode).toEqual(201);
    })

    describe("POST /books Errors", function() {
        
        test("Error if isbn is not number", async function() {
            bookData["isbn"] = "asdfasdffasdf";

            const res = await request(app).post(`/books`).send(bookData);
            expect(res.statusCode).toEqual(400);
        })
        test("Error if page is not number type", async function() {
            bookData["pages"] = "264";

            const res = await request(app).post(`/books`).send(bookData);

            expect(res.statusCode).toEqual(400);
        })
        test("Error if year is not number type", async function() {
            bookData["year"] = "2017";

            const res = await request(app).post(`/books`).send(bookData);

            expect(res.statusCode).toEqual(400);
        })
    })

})

describe("PUT /books/:isbn", function (){
    test("Updates a book (entirely) based on isbn", async function() {
        let putTest = "I changed this for my test";
        b1.title = putTest;
        b1.pages = 999;
        b1.year = 2020;
        const res = await request(app).put(`/books/${b1.isbn}`)
            .send(b1);
            expect(res.statusCode).toEqual(200);
            expect(res.body).toEqual({book: b1});
    })

    describe("PUT /books/:isbn Errors", function(){
        test("404 Error if isbn not found", async function(){
            const res = await request(app).put(`/books/sadfasdf`)
                .send(b1);

            expect(res.statusCode).toEqual(404);
        })
        test("Update fails if unable to validate schema", async function() {
            b1.pages = "999";
            b1.year = "2000";

            const res = await request(app).put(`/books/${b1.isbn}`)
                .send(b1);
                expect(res.statusCode).toEqual(400);
        })
    })
})

describe("DELETE /books/:isbn", function() {
    test("Deletes a book based on isbn", async function() {
        const res = await request(app).delete(`/books/${b1.isbn}`);

        expect(res.statusCode).toEqual(200);
        expect(res.body).toEqual({message: "Book deleted"});
    })

    test("404 error if isbn not found", async function() {
        const res = await request(app).delete("/books/9999999");

        expect(res.statusCode).toEqual(404);
    })
})

/*******************************/
afterAll(async function() {
    await db.end();
})