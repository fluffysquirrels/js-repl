(setg do
	(macro (*exprs)
		(cons
			(cons 'func
			(cons '()
				  *exprs
			))
		)
	)
)

(setg apply
	(func (a-func args)
		(eval (cons a-func args))
	))

(do
	(setg cond-int
		(func (clauses)
			(if (null-or-empty-list? clauses)
				(list 'throwNoConditionEvaluatedTrue)
				(do
					(setl curr-clause (car clauses))
					(list
						'if (car curr-clause)
							(car (cdr curr-clause))
							(cond-int (cdr clauses))
					)
				)
			)
		))
	(setg cond
		(macro (*clauses)
			(cond-int *clauses)
		))
)

(setg not (func (x)
	(if x
		false
		true
	)
))

(setg and (macro (a b)
	(list
		'if a
			b
			false
	)
))

(setg or (macro (a b)
	(list
		'if a
			true
			b
	)
))


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
			(list (func () (< x 5)) (func () (list x 'lessthan5)))
			(list (func () (> x 5)) (func () (list x 'morethan5)))
			(list (func () true) (func () (list x 'equals5)))
		)
	)
))


(setg eval-debug
	(macro (expr)
		(list
			'list
			(list 'quot expr)
			'(quot =)
			expr
		)
	)
)

