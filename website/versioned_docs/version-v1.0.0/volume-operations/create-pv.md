---
id: version-v1.0.0-create-pv
title: Create PV
sidebar_label: Create PV
original_id: create-pv
---

To create a PV, you need to first create a PVC. Once done, IOMesh will detect the creation of the PVC and automatically generate a new PV based on its specs, binding them together. Then the pair of PV and PVC will be ready for use. 

> _NOTE:_ IOMesh supports access modes `ReadWriteOnce`，`ReadWriteMany`，and `ReadOnlyMany`, but `ReadWriteMany` and `ReadOnlyMany` are only for PVs with `volumemode` as Block.

**Prerequisite**

Ensure that there is already a StorageClass available for use.

**Procedure**
1. Create a YAML config `pvc.yaml`. Configure the fields `accessModes`, `storage`, and `volumeMode`.

    ```yaml
    # Source: pvc.yaml
    apiVersion: v1
    kind: PersistentVolumeClaim
    metadata:
      name: iomesh-example-pvc
    spec:
      storageClassName: iomesh-csi-driver
      accessModes:
        - ReadWriteOnce # Specify the access mode. 
      resources:
        requests:
          storage: 10Gi # Specify the storage value.
      volumeMode: Filesystem # Specify the volume mode.
    ```

    For details, refer to [Kubernetes Persistent Volumes](https://kubernetes.io/docs/concepts/storage/persistent-volumes/).
  
2. Apply the YAML config to create the PVC. Once done, the corresponding PV will be created.

    ```
    kubectl apply -f pvc.yaml
    ```

3. Verify that the PVC was created.

    ```
    kubectl get pvc iomesh-example-pvc
    ```
   If successful, you should see output like this:
    ```output
    NAME                                        STATUS   VOLUME                                     CAPACITY   ACCESS MODES   STORAGECLASS        AGE
    iomesh-example-pvc                          Bound    pvc-34230f3f-47dc-46e8-8c42-38c073c40598   10Gi        RWO            iomesh-csi-driver   21h   
    ```

4. View the PV bound to this PVC. You can find the PV name from the PVC output.

    ```
    kubectl get pv pvc-34230f3f-47dc-46e8-8c42-38c073c40598
    ```
   If successful, you should see output like this:
    ```output
    NAME                                       CAPACITY   RECLAIM POLICY   STATUS   CLAIM                        STORAGECLASS
    pvc-34230f3f-47dc-46e8-8c42-38c073c40598   10Gi       Delete           Bound    default/iomesh-example-pvc   iomesh-csi-driver
    ```

