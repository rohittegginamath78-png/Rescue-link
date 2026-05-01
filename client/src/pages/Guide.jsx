import { Link } from "react-router-dom";

const guides = [
  {
    animal: "Squirrel",
    quick: "Do: keep warm and quiet. Do not: give milk or force water.",
    details:
      "If the squirrel is cold, place it in a ventilated box lined with soft cloth. Young squirrels often need warmth before any feeding is considered.",
  },
  {
    animal: "Pigeon",
    quick: "Do: place in a box with air holes. Do not: splint wings yourself.",
    details:
      "A quiet, dark box reduces shock. If the bird is bleeding or drooping a wing, contact a rescuer quickly.",
  },
  {
    animal: "Sparrow",
    quick: "Do: watch first. Do not: remove a healthy fledgling too quickly.",
    details:
      "Many fledglings belong on the ground while parents feed nearby. Intervene only for visible injury, predators, or unsafe roads.",
  },
  {
    animal: "Rabbit",
    quick: "Do: keep pets away. Do not: chase or repeatedly touch.",
    details:
      "Wild rabbits stress very easily. If injured, contain only when necessary and keep handling to an absolute minimum.",
  },
  {
    animal: "Crow",
    quick:
      "Do: step back and observe. Do not: separate from alert parents unless needed.",
    details:
      "Crow fledglings often have protective adults nearby. Injured adults should be boxed and kept away from noise.",
  },
  {
    animal: "Mongoose",
    quick: "Do: call a rescuer. Do not: attempt hands-on handling.",
    details:
      "Mongooses can bite and twist suddenly. Use distance and professional help, especially if trapped or bleeding.",
  },
  {
    animal: "Owl",
    quick:
      "Do: use thick cloth if containment is unavoidable. Do not: stare or crowd the bird.",
    details:
      "Owls stress quickly in bright light. Darkness and quiet matter more than feeding in the first hour.",
  },
  {
    animal: "Deer",
    quick:
      "Do: maintain distance. Do not: move a fawn unless immediate danger exists.",
    details:
      "A fawn left alone may still be under maternal care. If collision or major injury is involved, call wildlife responders immediately.",
  },
  {
    animal: "Monitor Lizard",
    quick: "Do: isolate the area. Do not: try to grab or pin it down.",
    details:
      "Monitor lizards can inflict serious bites and tail strikes. Professional rescue is the right first step.",
  },
  {
    animal: "Bat",
    quick: "Do: avoid direct contact. Do not: pick up bare-handed.",
    details:
      "Use a towel or box only if absolutely necessary. Any bite or scratch to a person needs medical attention.",
  },
  {
    animal: "Snake",
    quick: "Do: clear people away. Do not: handle, trap, or kill the snake.",
    details:
      "Treat every snake as potentially dangerous. Karnataka regulations also make professional handling the safest option.",
  },
];

export default function Guide() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-12 text-center">
        <h1 className="mb-4 text-3xl font-medium text-gray-900 md:text-4xl">
          Quick Animal Guides
        </h1>
        <p className="mx-auto max-w-2xl text-lg text-gray-600">
          Basic care tips for common wild animals. For detailed guidance, ask
          the AI advisor.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {guides.map((guide) => (
          <div
            key={guide.animal}
            className="card transition-shadow hover:shadow-lg"
          >
            <h2 className="mb-3 font-medium text-gray-900">{guide.animal}</h2>
            <p className="mb-4 text-sm leading-relaxed text-gray-600">
              <strong>Quick summary:</strong> {guide.quick}
            </p>
            <p className="mb-4 text-xs italic text-gray-500">{guide.details}</p>
            <Link
              to={`/chat?animal=${guide.animal.toLowerCase()}`}
              className="inline-block text-xs font-medium text-green-600 hover:text-green-700"
            >
              Ask AI about this
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
