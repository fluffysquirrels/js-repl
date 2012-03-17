(setg condf
	(func (conds)
		(if (null? conds)
			throwNoCondHitError)
		
		(setl currCond (car conds))
		(setl currCond-cond (car currCond))
		(setl currCond-res (car (cdr currCond)))
		
		(if (currCond-cond)
			(currCond-res)
			(condf (cdr conds))
		)
	)
)

(setg condf-test (func (x)
	(condf
		(list
			(list (func () (< x 5)) (func () (list x (quot lessthan5))))
			(list (func () (> x 5)) (func () (list x (quot morethan5))))
			(list (func () true) (func () (list x (quot equals5))))
		)
	)
))

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

(setg list
	(func (*values)
		*values
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

(setg do
	(macro (*exprs)
		(cons
			(cons (quot func)
			(cons (quot ())
				  *exprs
			))
		)
	)
)

(setg eval-debug
	(macro (expr)
		(list
			(quot list)
			(list (quot quot) expr)
			(quot (quot =))
			expr
		)
	)
)

(setg sqrt-ceil (func (n)
	(setl is-pos-and-square-greater-than-n
		(func (x)
			(and
				(>= x 0)
				(>= (* x x) n)
			)
		)
	)
	(int-range-infimum is-pos-and-square-greater-than-n)
))

(setg int-range-infimum
	(func (predicate)
		(setl init-max-range (int-pow-2 24))
		(setl init-min-range (- 0 init-max-range))

		(setl find-infimum
			(func (min-range max-range)
				(if (predicate min-range)
					(throwMinPassedPredicate))
				(if (not (predicate max-range))
					(throwMaxNotPassedPredicate))
				
				(setl len-range (- max-range min-range))

				(if (< len-range 1)
					(throwRangeLengthLessThanOne))
				(if (= len-range 1)
					max-range
					(do
						(setl mid-range
							(+ min-range (/ len-range 2)))
						(if (predicate mid-range)
							(find-infimum
								min-range mid-range)
							(find-infimum
								mid-range max-range)
						)
					)
				)
			)
		)

		(find-infimum init-min-range init-max-range)
	)
)

(setg int-pow-2
	(func (n)
		(if (<= n 0)
			1
			(* 2 (int-pow-2 (- n 1)))
		)
	)
)
