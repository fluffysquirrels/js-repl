(setg cmp (func (x y)
	(if (= x y)
		0
	(if (> x y)
		1
	(if (< x y)
		-1
		throwError)
))))


(setg si (func (x)
	(if (= x 1)
		1
	(+ x (si (- x 1))))
))

(setg listeq
	(func (a b) 
		(if (js= (car a) (car b))
			(if(js= (cdr a) null)
				(js= (cdr b) null)
				(if (js= (cdr b) null)
					false
					(aeq (cdr a) (cdr b))
				)
			)
			false
		)
	)
)
