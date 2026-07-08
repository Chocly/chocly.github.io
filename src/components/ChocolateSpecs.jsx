// ChocolateSpecs — the facts table for a chocolate bar. A real <table> on
// purpose: labeled rows are what search engines and AI assistants extract and
// cite. Renders only rows that have data.
import './ChocolateSpecs.css';

function formatIngredients(ingredients) {
  if (!ingredients) return null;
  if (Array.isArray(ingredients)) return ingredients.join(', ');
  return String(ingredients);
}

function ChocolateSpecs({ chocolate }) {
  if (!chocolate) return null;

  const n = chocolate.nutritionalInfo || {};
  const ingredients = formatIngredients(chocolate.ingredients);

  const rows = [
    ['Maker', chocolate.maker],
    ['Type', chocolate.type],
    ['Cacao percentage', chocolate.cacaoPercentage ? `${chocolate.cacaoPercentage}%` : null],
    ['Origin', chocolate.origin],
    ['Ingredients', ingredients],
    ['Serving size', n.servingSize],
    ['Calories', n.calories != null ? `${n.calories} kcal per serving` : null],
    ['Fat', n.fat != null ? `${n.fat} g per serving` : null],
    ['Sugar', n.sugar != null ? `${n.sugar} g per serving` : null],
    ['Protein', n.protein != null ? `${n.protein} g per serving` : null],
  ].filter(([, value]) => value != null && value !== '');

  // Show the table whenever there's anything worth showing (maker + type alone
  // is useful); only suppress an entirely empty table.
  if (rows.length === 0) return null;

  return (
    <section className="chocolate-specs" aria-labelledby="specs-heading">
      <h3 id="specs-heading">
        {chocolate.name} — Facts &amp; Ingredients
      </h3>
      <table className="specs-table">
        <tbody>
          {rows.map(([label, value]) => (
            <tr key={label}>
              <th scope="row">{label}</th>
              <td>{value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}

export default ChocolateSpecs;
