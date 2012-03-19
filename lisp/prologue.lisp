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

(setg and (macro (a b)
	(list
		(quot if) a
			b
			false
	)
))

(setg or (macro (a b)
	(list
		(quot if) a
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

(setg mod
	(func (a b)
		(setl divrem-result (divrem a b))
		(car (cdr divrem-result))
	)
)

(setg list
	(func (*values)
		*values
	)
)

(setg push
	(func (a-list elt)
		(if (null? a-list)
			(cons elt)
			(cons 	(car a-list)
					(push (cdr a-list) elt))
		)
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

(setg num-seq
	(func (min upper-bound)
		(if (>= min upper-bound)
			(quot ())
			(cons
				min
				(num-seq
					(+ min 1)
					upper-bound
				)
			)
		)
))

(setg num-odd? (func (n)
	(setl mod2 (mod n 2))
	(= mod2 1)
))
	
(setg num-even? (func (n)
	(setl mod2 (mod n 2))
	(= mod2 0)
))

(setg filter (func (elts pred)
		(if (or (null? elts) (eq elts (quot ())))
			(quot ())
		(do
			(setl curr-elt (car elts))
			(setl get-rest (func ()
				(filter (cdr elts) pred)
			))
			(if (pred curr-elt)
				(cons curr-elt (get-rest))
				(get-rest)
			)
		))
	)
)

(setg map (func (elts map-func)
	(if (null? elts)
		(quot ())
	(cons
		(map-func (car elts))
		(map (cdr elts) map-func)
	))
))

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

(do
  	(setl it-is-oo-time true)

	(setl type-of-type
		(quot
			(record
				(type-name type)
				(fields
					(type-name symbol type)
				)
			)
		)
	)

	(setl types
		(list
			type-of-type
		)
	)

	(setg new
		(func (type-name)
			(if (not (sym= type-name (quot type)))
				throwThisTypeNotYetImplementedException)

			(list
				(quot (record))
				(list (quot type-name) type-name)
				(quot (fields))
			)
		)
	)

	(setg with-values
		(do
			(setg partition (func (a-list set1-predicate)
				(setl set2-predicate
					(func (elt) (not (set1-predicate elt))))

				(setl set1
					(filter a-list set1-predicate))
				(setl set2
					(filter a-list set2-predicate))

				(list set1 set2)
			))

			(setl is-child-called
				(func(child-name)
					(func (elt)
						(and
							(and 	(cons? elt)
								 	(sym? (car elt)))
									(sym= (car elt) child-name))			
					)
				)
			)

			(setl with-value
				(func (rec field-value)
					
					(setl field-name (car field-value))

					(setl record-partition
						(partition rec
							(is-child-called (quot fields))))

					(setl record-fields (cdr (car (car record-partition))))
					(setl record-others (car (cdr record-partition)))
					
					(setl fields-partition
							(partition record-fields
								(is-child-called field-name)))

					(setl unmodified-fields
						(car (cdr fields-partition)))
					
					(setl
						new-record-fields
						(cons (quot fields) (cons field-value unmodified-fields)))
					
					(push record-others new-record-fields)
				)
			)

		  	(func (rec field-values)
				(if (null? field-values)
					rec
				(do
					(setl rec-one-changed
						(with-value rec (car field-values)))

				  	(with-values
						rec-one-changed
						(cdr field-values))
				))
			)
		)
	)
)


