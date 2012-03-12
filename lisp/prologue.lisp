(setg condf
	(func (conds)
		(if (null? conds)
			throwNoCondHitError)
		
		(setl currCond (car conds))
		(setl currCond-cond (car currCond))
		(setl currCond-res (car (cdr currCond)))
		
		(if (eval currCond-cond)
			(eval currCond-res)
			(condf (cdr conds))
		)
	)
)

(setg not (func (x)
	(if x
		false
		true
	)
))

(setg and (func (a b)
	(if a
		b
		false
	)
))

(setg or (func (a b)
	(if a
		true
		b
	)
))

(setg divrem
	(func (a b)
		(setl divrem-int
			(func (a b acc)
				(if (< a b)
					(cons acc (cons a))
					(divrem-int (- a b) b (+ acc 1))
				)
			)
		)
		(divrem-int a b 0) 
	)
)



(setg eq
	(func (a b)
		(if (not (sym= (jstypeof a) (jstypeof b)))
			false
		(if (cons? a)
			(listeq a b)
		(if (sym? a)
			(sym= a b)
		(js= a b)
		)))
	)
)

(setg listeq
	(func (a b) 
		(if (eq (car a) (car b))
			(if(eq (cdr a) null)
				(eq (cdr b) null)
				(if (eq (cdr b) null)
					false
					(listeq (cdr a) (cdr b))
				)
			)
			false
		)
	)
)

(setg si (func (x)
	(if (= x 1)
		1
	(+ x (si (- x 1))))
))


(setg num-cmp (func (x y)
	(if (= x y)
		0
	(if (> x y)
		1
	(if (< x y)
		-1
		throwError)
))))
