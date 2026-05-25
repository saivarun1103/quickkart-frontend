import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'
import { MemoryRouter } from 'react-router-dom'

import Headers from '../components/Headers'

test(
  'updates search input when user types',
  async () => {

    const setSearch = vi.fn()

    render(
      <MemoryRouter>
        <Headers
          search=""
          setSearch={setSearch}
          toggleSidebar={() => {}}
        />
      </MemoryRouter>
    )

    const searchInputs =
    screen.getAllByPlaceholderText(
        'Search menu, orders, analytics...'
    )

    const searchInput = searchInputs[0]

    await userEvent.type(
      searchInput,
      'idli'
    )

    expect(setSearch)
      .toHaveBeenCalled()
  }
)