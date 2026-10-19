import React from "react";

/**
 * Componente Skeleton Loading
 * Muestra un placeholder mientras carga
 */
export function SkeletonLoader({ count = 5, width = "100%", height = "20px" }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="bg-gray-300 animate-pulse rounded"
          style={{ width, height }}
        />
      ))}
    </div>
  );
}

/**
 * Skeleton para tabla
 */
export function TableSkeleton({ rows = 5, columns = 4 }) {
  return (
    <div className="space-y-2">
      {/* Header */}
      <div className="flex gap-2 p-4 bg-gray-100 rounded">
        {Array.from({ length: columns }).map((_, i) => (
          <div
            key={`header-${i}`}
            className="flex-1 h-6 bg-gray-300 animate-pulse rounded"
          />
        ))}
      </div>

      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIdx) => (
        <div key={`row-${rowIdx}`} className="flex gap-2 p-4 border border-gray-200 rounded">
          {Array.from({ length: columns }).map((_, colIdx) => (
            <div
              key={`col-${colIdx}`}
              className="flex-1 h-6 bg-gray-300 animate-pulse rounded"
            />
          ))}
        </div>
      ))}
    </div>
  );
}

/**
 * Skeleton para card
 */
export function CardSkeleton() {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
      <div className="h-8 bg-gray-300 animate-pulse rounded w-3/4" />
      <div className="space-y-2">
        <div className="h-4 bg-gray-300 animate-pulse rounded" />
        <div className="h-4 bg-gray-300 animate-pulse rounded w-5/6" />
      </div>
      <div className="h-10 bg-gray-300 animate-pulse rounded" />
    </div>
  );
}

/**
 * Skeleton para formulario
 */
export function FormSkeleton({ fields = 4 }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: fields }).map((_, i) => (
        <div key={i} className="space-y-2">
          <div className="h-4 bg-gray-300 animate-pulse rounded w-1/4" />
          <div className="h-10 bg-gray-300 animate-pulse rounded" />
        </div>
      ))}
      <div className="flex gap-2 pt-4">
        <div className="h-10 bg-gray-300 animate-pulse rounded flex-1" />
        <div className="h-10 bg-gray-300 animate-pulse rounded flex-1" />
      </div>
    </div>
  );
}

/**
 * Hook para mostrar skeleton mientras carga
 */
export function useSkeletonLoading(loading, SkeletonComponent = SkeletonLoader) {
  if (loading) {
    return <SkeletonComponent />;
  }
  return null;
}

/**
 * Wrapper para mostrar skeleton o contenido
 */
export function SkeletonWrapper({ loading, children, skeleton = <SkeletonLoader /> }) {
  if (loading) {
    return skeleton;
  }
  return children;
}
