---
layout: post
section-type: post
title: Ecto Custom Validation Elixir Phoenix
category: elixir
tags: [ 'elixir', 'tech' ]
comments: true
---

We often need to validate fields that are passed through a struct in Ecto
Changesets. Custom validations are very straightforward to write and can be
composed with one another easily. By using validate_change/3 which invokes a validator function, the function returns either a) the changeset or b) the changeset with errors if the validation fails.

Let’s take a look at a changeset with a custom validation validate_list_format:

<pre><code data-trim class="yaml">

  def changeset(struct, params \\ %{}) do
    struct
    |> cast(params, @required_fields)
    |> validate_required(@required_fields)
    |> validate_list_format(:tags, format: ~r/^[aA-zZ]$/, message: "Please provide valid string")
  end

  def validate_list_format(changeset, field, options \\ []) do
    case changeset.valid? do
      true ->
        list = get_field(changeset, field)
        case Enum.all?(list, fn(item) -> Regex.match?(options[:format], item) end) do
          true -> changeset
          _ -> add_error(changeset, field, options[:message])
        end
      _ ->
        changeset
    end
  end

</code></pre>

validate_change/3: <a href="https://hexdocs.pm/ecto/Ecto.Changeset.html#validate_change/3">https://hexdocs.pm/ecto/Ecto.Changeset.html#validate_change/3</a>


Here, we simply pass a new function validate_list_format/3 to our changeset, which returns the changeset with no changes or with errors added. We can just as easily compose validations on top of one another in the form of validation functions that get piped to each other, which gives us our code a great deal of readability and flexibility.
