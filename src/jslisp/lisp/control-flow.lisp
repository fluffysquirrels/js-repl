(setg do
	(macro (*exprs)
		(cons
			(cons 'fn
			(cons '()
				  *exprs
			))
		)
	)
)

(setg let
	(macro (set-pair *exprs)
		(list
			(append
				(list
					'fn
					'()
					(list
						'setl
						(car set-pair)
						(second set-pair)
					)
				)
				*exprs
			)
		)
	))

(setg apply
	(fn (a-fn args)
		(eval (cons a-fn args))
	))

(do
	(setg cond-int
		(fn (clauses)
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

(setg not (fn (x)
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
	(fn (conds)
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

(setg condf-test (fn (x)
	(condf
		(list
			(list (fn () (< x 5)) (fn () (list x 'lessthan5)))
			(list (fn () (> x 5)) (fn () (list x 'morethan5)))
			(list (fn () true) (fn () (list x 'equals5)))
		)
	)
))

(setg eval-debug
	(macro (expr)
		(list
			'list
			(list 'quote expr)
			'(quote =)
			expr
		)
	))

(setg macrotest
  (macro (arg-defns *body-exprs)
    (list
      'macro
      arg-defns
      (list
        'setl
        '__macrotest-result
        (cons
          'do
          *body-exprs
        )
      )
      (list
        'list
        '(quote quote)
        '__macrotest-result
      )
    )
  ))

(setg get-macro-value-list-from-value-clauses
  (fn (value-clauses)
    (cons 'list
      (map value-clauses
        (fn (clause)
          (if (not (null? (cdr (cdr clause))))
            throw-tooManyValuesInClause)
          (list
            'list
            (list 'quote (car clause))
            (second clause)
          )
        )
      )
    )
  ))
