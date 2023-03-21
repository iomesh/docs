---
id: restore-volumesnapshot
title: Restoring Volume from Snapshot
sidebar_label: Restoring Volume from Snapshot
---


Restoring a VolumeSnapshot means creating a PVC while specifying the `dataSource` field referencing to the target snapshot. 

快照恢复是否有前提条件或注意事项
新卷的容量需和原卷保持一致

**Procedure**

1. Create a PVC `restore。yaml`.

    ```yaml
    apiVersion: v1
    kind: PersistentVolumeClaim
    metadata:
      name: example-restore
    spec:
      storageClassName: iomesh-csi-driver
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
    kubectl apply -f restore.yaml
    ```
3. Run the following command to view the restored PV.

    ```bash
    kubectl 加一个命令，或者 example 结果
    ```
