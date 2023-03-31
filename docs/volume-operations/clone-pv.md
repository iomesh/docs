---
id: clone-pv
title: Clone PV
sidebar_label: Clone PV
---

A clone is a duplicate of an existing volume in the system and data on the source will be duplicated to the destination. To clone a PV, you should create a new PVC and specify an existing PVC in the field `dataSource` so that you can clone a volume based on it.

**Precautions**
- The source PVC and the destination PVC must be in the same namespace.
- The source PVC and the destination PVC must have the same StorageClass and VolumeMode configurations.
- The capacity value must be the same or larger than that of the source PVC.

**Prerequisite**

Verify that there is already a PVC available for cloning.

**Procedure**
1. Create a YAML config `clone.yaml`. Specify the source PVC in the field `name`.

    ```yaml
    apiVersion: v1
    kind: PersistentVolumeClaim
    metadata:
      name: cloned-pvc
    spec:
      storageClassName: iomesh-csi-driver
      dataSource:
        name: existing-pvc # Specify the source PVC in the same namespace. 
        kind: PersistentVolumeClaim
      accessModes:
        - ReadWriteOnce
      resources:
        requests:
          storage: 5Gi # The capacity value must be the same or larger than that of the source volume.
      volumeMode: Block
    ```

2. Apply the YAML config. Once done, a clone of `existing-pvc` will be created.

    ```bash
    kubectl apply -f clone.yaml
    ``` 
   
3. Check the new PVC.

    ```
    kubectl get pvc cloned-pvc
    ```
   After running the command, you should see an example like:
    ```output
    NAME                                        STATUS   VOLUME                                     CAPACITY   ACCESS MODES   STORAGECLASS        AGE
    cloned-pvc                                  Bound    pvc-44230f3f-47dc-46e8-8c42-38c073c40598   5Gi        RWO            iomesh-csi-driver   21h   
    ```
4. 加一个查看 PV 的命令和结果