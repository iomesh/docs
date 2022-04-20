---
id: version-0.11.0-snapshot-restore-and-clone
title: Snapshot, Restore and Clone
sidebar_label: Snapshot, Restore and Clone
original_id: snapshot-restore-and-clone
---

## Snapshot

Users can use IOMesh to create a snapshot for an existing persistent volume (PV).

A VolumeSnapshot object defines a request for taking a snapshot of the PVC.

For example:

```yaml
apiVersion: snapshot.storage.k8s.io/v1beta1
kind: VolumeSnapshot
metadata:
  name: example-snapshot
spec:
  volumeSnapshotClassName: iomesh-csi-driver-default
  source:
    persistentVolumeClaimName: mongodb-data-pvc # PVC name that want to take snapshot
```

Apply the YAML file:

```text
kubectl apply -f example-snapshot.yaml
```

After the VolumeSnapshot object is created, a corresponding VolumeSnapshotContent object will be created by IOMesh.

```bash
kubectl get Volumesnapshots example-snapshot
```

```output
NAME               SOURCEPVC            RESTORESIZE    SNAPSHOTCONTENT                                    CREATIONTIME
example-snapshot   mongodb-data-pvc     6Gi            snapcontent-fb64d696-725b-4f1b-9847-c95e25b68b13   10h
```

## Restore

Users can restore a volume snapshot by creating a PVC in which the `dataSource` field references to a snapshot.

For example:

```yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: example-restore
spec:
  storageClassName: iomesh-csi-driver-default
  dataSource:
    name: example-snapshot
    kind: VolumeSnapshot
    apiGroup: snapshot.storage.k8s.io
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 6Gi
```

Apply the YAML file:

```bash
kubectl apply -f example-restore.yaml
```

## Clone

Users can clone a persistent volume (PV) by creating a PVC while adding a dataSource linked to an existing PVC in the same namespace.

For example:

```yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: cloned-pvc
spec:
  storageClassName: iomesh-csi-driver-default
  dataSource:
    name: existing-pvc # an existing PVC in the same namespace
    kind: PersistentVolumeClaim
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 5Gi
  volumeMode: Block
```

Apply the YAML file:

```bash
kubectl apply -f example-clone.yaml
```

After applying the YAML file, a clone of `existing-pvc` will be created.

There are some limitations on clone operation:

1. A cloned PVC must exist in the same namespace as the original PVC.
2. Both PVCs must have the same StorageClass and VolumeMode setting.
