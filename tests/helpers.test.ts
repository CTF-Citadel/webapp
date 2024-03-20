import { expect, test } from 'vitest'
import { validEmail, validPassword, validUsername } from "../src/lib/helpers";

let incorrectEmail = "example.com"
test(`"${incorrectEmail}" is invalid email`, () => {
    expect(validEmail(incorrectEmail)).toBe(false)
})

let correctEmail = "user@example.com"
test(`"${correctEmail}" is valid email`, () => {
    expect(validEmail(correctEmail)).toBe(true)
})

let incorrectPassword = 'password123';
test(`"${incorrectPassword}" is invalid password`, () => {
    expect(validPassword(incorrectPassword)).toBe(false)
})

let correctPassword = "MySuperSecretP@ssw0rd!";
test(`"${correctPassword}" is valid password`, () => {
    expect(validPassword(correctPassword)).toBe(true)
})

let incorrectUser = 'hi';
test(`"${incorrectUser}" is invalid username`, () => {
    expect(validUsername(incorrectUser)).toBe(false)
})

let correctUser = "user";
test(`"${correctUser}" is valid username`, () => {
    expect(validUsername(correctUser)).toBe(true)
})
