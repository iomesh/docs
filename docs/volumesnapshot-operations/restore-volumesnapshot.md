---
id: restore-volumesnapshot
title: Restoring Volume from Snapshot
sidebar_label: Restoring Volume from Snapshot
---


Restoring a VolumeSnapshot means creating a PVC while specifying the `dataSource` field referencing to the target snapshot. 

**Procedure**

1. Create a PVC `example-restore`.

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

2. Run the following command to apply the YAML file. 

    ```bash
    kubectl apply -f example-restore.yaml
    ```