---
id: snapshot-restore-and-clone
title: Snapshot, Restore and Clone
sidebar_label: Snapshot, Restore and Clone
---

## Snapshot

IOMesh is able to create a snapshot for an existing persistent volume (PV) by using a VolumeSnapshot object.

A VolumeSnapshot object defines a request for taking a snapshot by using a PVC.

For example:

```text
example-snapshot.yaml
```

```output
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

User can restore a volume snapshot by creating a PVC in which the `dataSource` field references to a snapshot.

For example:

```text
restore.yaml
```

```output
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

After applying the YAML file, a clone of `existing-pvc` will be created.

There are some limitations on clone operation:

1. A cloned PVC must exist in the same namespace as the original PVC with the same StorageClass.
2. The new source PVC must have the same VolumeMode setting.
