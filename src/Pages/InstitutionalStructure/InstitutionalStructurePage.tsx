/**
 * InstitutionalStructurePage - Gestión de estructura institucional.
 *
 * Contiene SectionTabs propios para: Universidades / Sedes / Carreras.
 * Soporta modo embedded: delega PageHeader y headerExtra al padre.
 */

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { SearchInput } from '@/Components/Ui/Forms/SearchInput';
import { Button } from '@/Components/Ui/Buttons/Button';
import { ScreenContainer } from '@/Components/Ui/Layout/ScreenContainer';
import { PageHeader } from '@/Components/Ui/Index';
import { useAuth } from '@/Context/AuthContext';
import { InstitutionalCreateModal } from './Components/InstitutionalCreateModal';
import { InstitutionalHierarchyTable } from './Components/InstitutionalHierarchyTable';

const MODULE_HEADER = {
  title: 'Estructura institucional',
  description:
    'Gestione las universidades, sedes y carreras registradas en el sistema.',
};

interface EmbeddedHeaderMeta {
  title: string;
  description?: string;
  breadcrumbMode?: 'none' | 'simple' | 'cycle-only' | 'contextual';
  breadcrumbParent?: { label: string; href: string };
}

interface Props {
  embedded?: boolean;
  onHeaderExtraChange?: (node: React.ReactNode) => void;
  onHeaderMetaChange?: (meta: EmbeddedHeaderMeta | null) => void;
}

const InstitutionalStructurePage: React.FC<Props> = ({
  embedded = false,
  onHeaderExtraChange,
}) => {
  const { canAccess } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [refreshSignal, setRefreshSignal] = useState(0);

  const canCreateAny = canAccess({
    requireAnyPermissions: ['universidades.create', 'campuses.create', 'carreras.create'],
  });

  const handleCreated = useCallback(() => {
    setRefreshSignal((prev) => prev + 1);
  }, []);

  const headerExtra = useMemo(
    () => (
      <div className="flex flex-col sm:flex-row w-full gap-2 shrink-0 lg:w-auto items-end">
        <SearchInput
          placeholder="Buscar..."
          value={searchQuery}
          onChange={setSearchQuery}
          className="w-full sm:w-72"
        />
        {canCreateAny && (
          <Button variant="secondary" onClick={() => setIsCreateModalOpen(true)}>
            Crear
          </Button>
        )}
      </div>
    ),
    [canCreateAny, searchQuery],
  );

  useEffect(() => {
    if (!embedded) {
      return undefined;
    }

    onHeaderExtraChange?.(headerExtra);
  }, [embedded, headerExtra, onHeaderExtraChange]);

  useEffect(() => {
    if (!embedded) return undefined;
    return () => onHeaderExtraChange?.(null);
  }, [embedded, onHeaderExtraChange]);

  const content = (
    <>
      <InstitutionalHierarchyTable
        searchQuery={searchQuery}
        refreshSignal={refreshSignal}
      />

      <InstitutionalCreateModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreated={handleCreated}
      />
    </>
  );

  if (embedded) return content;

  return (
    <ScreenContainer>
      <PageHeader
        title={MODULE_HEADER.title}
        description={MODULE_HEADER.description}
        breadcrumbMode="simple"
        headerExtra={headerExtra}
      />
      {content}
    </ScreenContainer>
  );
};

export default InstitutionalStructurePage;
