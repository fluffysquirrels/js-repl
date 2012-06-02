js-repl
=======

A REPL for JavaScript and (very limited) Lisp programming, implemented in JavaScript and HTML.

I started programming on my Android phone while on the train to and from work, using the fantastic Terminal IDE (https://play.google.com/store/apps/details?id=com.spartacusrex.spartacuside). Over the course of a few months, I wrote this in Vim.

It began as a single HTML page with a text box as a REPL to run JavaScript, so I could write code on the train. I then got inspired to muck around with Lisp again, so I decided to write my own. The result is a limited Lisp, with an interpreter written in JavaScript. There are a few hundred unit tests verifying most of the Lisp interpreter and library functions.

Lisp's flexibility has intrigued me for quite some time. I remember reading that the first OO experiments in Lisp were written as libraries. I wanted to see how this could be done, and what potential uses this flexibility would have in more mundane code, like business applications.

At the moment, I'm working on an implementation of an embedded Lisp type system, written just in Lisp. So far there are immutable records that obey pre-defined types. Each record contains only fields that are defined in its type, but not all fields need to be present with values. Each field has a type, which is either another record or a primitive type implemented in the JavaScript library.