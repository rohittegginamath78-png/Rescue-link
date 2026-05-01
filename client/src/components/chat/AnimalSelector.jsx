import { ANIMALS } from '../../constants/animals'
import Pill from '../ui/Pill'

export default function AnimalSelector({ selected, onSelect }) {
  return (
    <div className="flex flex-wrap gap-2">
      {ANIMALS.map((animal) => (
        <Pill key={animal} tone="green" active={selected === animal} onClick={() => onSelect(animal)}>
          {animal}
        </Pill>
      ))}
    </div>
  )
}
