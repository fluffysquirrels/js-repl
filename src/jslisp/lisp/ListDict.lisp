(do
  (setg ListDict.new
    (macro (*initial-value-clauses)
      (list
        'ListDict.from-list
        (get-macro-value-list-from-value-clauses
          *initial-value-clauses)
      )
    ))
  (setg ListDict.from-list
    (fn (initial-values)
      (if (null-or-empty-list? initial-values)
          '(dict)
        (ListDict.with-values
          '(dict)
          initial-values)
      )
    ))

  (setg ListDict.is?
    (fn (obj)
      (cond
        ((not (cons? obj)) false)
        ((not (sym? (car obj))) false)
        ((not (sym= (car obj) 'dict)) false)
        (true true)
      )
    ))
  (setg ListDict.has?
    (fn (ldict key)
      (setl value
        (ListDict.tryget ldict key))
      (not (null? value))
    ))
  (setg ListDict.get
    (fn (ldict key)
      (setl value
        (ListDict.tryget ldict key))
      (if (null? value)
        throw-keyNotFoundException
          value
      )
    ))
  (do
    (setg ListDict.tryget
        (fn (ldict key)
        (tryget-int (cdr ldict) key)
        ))
    (setl tryget-int
      (fn (pairs key)
        (if (null-or-empty-list? pairs)
          null
          (let (curr-pair (car pairs))
            (if (sym= (car curr-pair) key)
              (second curr-pair)
              (tryget-int (cdr pairs) key)
            )
          )
        )
      ))
  )
  (setg ListDict.keys
    (fn (ldict)
      (setl pairs (cdr ldict))
      (map pairs car)
    ))
  (setg ListDict.with-value
    (fn (ldict key value)
    (setl pairs (cdr ldict))
      (setl unmodified-pairs
      (filter
        pairs
          (fn (pair)
        (not
            (sym= (car pair) key)
        ))
    ))
      (setl new-pair (list key value))

    (cons 'dict (cons new-pair unmodified-pairs))
  ))
  (setg ListDict.with-values
    (fn (ldict kv-pairs)
      (if (null-or-empty-list? kv-pairs)
        ldict
        (do
          (setl curr-kv-pair (car kv-pairs))
          (setl curr-key (car curr-kv-pair))
          (setl curr-value (second curr-kv-pair))
          (ListDict.with-values
            (ListDict.with-value ldict curr-key curr-value)
            (cdr kv-pairs)
          )
        )
      )
    ))
)
